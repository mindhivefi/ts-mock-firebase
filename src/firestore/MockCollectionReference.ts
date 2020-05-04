import { MockFirebaseFirestore } from '@firebase/app-types';
import {
  CollectionReference,
  DocumentChange,
  DocumentChangeType,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  GetOptions,
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SnapshotListenOptions,
  WhereFilterOp,
  FirestoreDataConverter,
} from '@firebase/firestore-types';

import { MockCollection, MockDocuments } from '.';
import { Mocker } from '../app';
import { deepCopy } from '../utils/deepCopy';
import MockDocumentReference, { ErrorFunction, MockSubscriptionFunction } from './MockDocumentReference';
import MockQuery, { MockQuerySnapshotCallback, MockQuerySnapshotObserver } from './MockQuery';
import MockQueryDocumentSnapshot from './MockQueryDocumentSnapshot';
import MockQuerySnapshot from './MockQuerySnapshot';
import { resolveReference } from './utils';
import MockCallbackHandler from './utils/CallbackHandler';

export interface CollectionMocker<T = DocumentData> extends Mocker {
  docRefs: () => MockDocumentReference<T>[];
  doc(id: string): MockDocumentReference<T>;

  /**
   * Set collection documents
   *
   * @param {MockDocumentReference} doc
   * @memberof CollectionMocker
   */
  setDoc(doc: MockDocumentReference<T>): void;

  /**
   * Delete document and return it's index where it was
   */
  deleteDoc(id: string): number;

  /**
   * Load mock collection content from MockCollection object
   */
  load(collection: MockCollection<T>): void;

  /**
   * Save mock collection data into a new MockCollection object
   *
   * @returns {MockCollection}
   * @memberof CollectionMocker
   */
  save(): MockCollection<T>;

  /**
   * Get a shallow object listing all documents as fields where each field contains
   * the data of the document
   *
   * @returns {{ [documentId: string]: DocumentData}}
   * @memberof CollectionMocker
   */
  getShallowCollection(): { [documentId: string]: T | undefined };

  /**
   * Set all documents of the collection by creating them from a single object
   * where eact field is a document and fields value is the data in the document
   * named by the field.
   */
  setShallowCollection(docs: { [documentId: string]: T }): void;

  reset(): void;
}

interface MockDocumentReferences<T> {
  [documentId: string]: MockDocumentReference<T>;
}
export class MockCollectionReference<T = DocumentData> implements CollectionReference<DocumentData> {
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path(): string {
    return this.parent?.id ? `${this.parent.path}/${this.id}` : this.id;
  }

  public mocker: CollectionMocker<T>;
  private _docRefs: MockDocumentReferences<T> = {};

  private _snapshotCallbackHandler = new MockCallbackHandler<QuerySnapshot>();

  // tslint:disable-next-line
  public constructor(
    public firestore: MockFirebaseFirestore,
    public id: string,
    public parent: DocumentReference | null = null
  ) {
    const me = this;

    this.mocker = {
      doc: (documentId: string) => {
        return me._docRefs[documentId];
      },
      setDoc: (doc: MockDocumentReference<T>) => {
        me._docRefs[doc.id] = doc;
      },

      docRefs: () => {
        return me.getDocs();
      },

      deleteDoc: (documentId: string) => {
        const index = Object.keys(me._docRefs).indexOf(documentId);
        delete me._docRefs[documentId];
        return index;
      },

      load: (collection: MockCollection) => {
        this.mocker.reset();

        if (collection.docs) {
          for (const documentId in collection.docs) {
            if (collection.docs.hasOwnProperty(documentId)) {
              const documentData = collection.docs[documentId];

              const document = new MockDocumentReference<T>(me.firestore, documentId, me as any);
              me.mocker.setDoc(document);
              document.mocker.load(documentData);
            }
          }
        }
      },

      save: (): MockCollection => {
        const collection: MockCollection = {};
        const docKeys = Object.getOwnPropertyNames(me._docRefs);
        if (docKeys.length > 0) {
          const docs: MockDocuments<T> = (collection.docs = {});
          for (const docId of docKeys) {
            if (me._docRefs[docId].data) {
              docs[docId] = me._docRefs[docId].mocker.saveDocument();
            }
          }
        }
        return collection;
      },

      getShallowCollection: () => {
        const docs: { [documentId: string]: T | undefined } = {};
        const docKeys = Object.getOwnPropertyNames(me._docRefs);

        for (const docId of docKeys) {
          const data = me._docRefs[docId].data;
          docs[docId] = deepCopy(data);
        }
        return docs;
      },

      setShallowCollection: (docs: { [documentId: string]: T }): void => {
        this.mocker.reset();

        for (const documentId in docs) {
          if (docs.hasOwnProperty(documentId)) {
            const documentData = docs[documentId];
            const document = new MockDocumentReference<T>(me.firestore, documentId, me as any);
            me.mocker.setDoc(document);
            document.mocker.setData(documentData);
          }
        }
      },

      reset: () => {
        for (const documentId in me._docRefs) {
          if (me._docRefs.hasOwnProperty(documentId)) {
            const doc = me._docRefs[documentId];
            doc.mocker.reset();
          }
        }
        me._docRefs = {};
        me._snapshotCallbackHandler.reset();
      },
    };
  }

  /**
   * Get a `DocumentReference` for the document within the collection at the
   * specified path. If no path is specified, an automatically-generated
   * unique ID will be used for the returned DocumentReference.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  public doc = (documentPath?: string): DocumentReference<T> => {
    return resolveReference(
      this.firestore,
      this.parent as any,
      false,
      documentPath || this.firestore.mocker.getNextDocumentId(this.path),
      false,
      this as any
    ) as unknown as DocumentReference<T>;
  }

  /**
   * Add a new document to this collection with the specified data, assigning
   * it a document ID automatically.
   *
   * @param data An Object containing the data for the new document.
   * @return A Promise resolved with a `DocumentReference` pointing to the
   * newly created document after it has been written to the backend.
   */
  public add = (data: T): Promise<DocumentReference<T>> => {
    return new Promise<DocumentReference<T>>((resolve, reject) => {
      const id = this.firestore.mocker.getNextDocumentId(this.path);
      const document = new MockDocumentReference<T>(this.firestore, id, this as any);
      this.mocker.setDoc(document);
      document.mocker.setData(deepCopy(data));

      document.fireDocumentChangeEvent('added');

      resolve(document as any);
    });
  }

  /**
   * Returns true if this `CollectionReference` is equal to the provided one.
   *
   * @param other The `CollectionReference` to compare against.
   * @return true if this `CollectionReference` is equal to the provided one.
   */
  public isEqual = (other: CollectionReference | Query): boolean => {
    return (this as any) === other;
  }

  /**
   * The `Firestore` for the Firestore database (useful for performing
   * transactions, etc.).
   */
  // readonly firestore: FirebaseFirestore;

  /**
   * Creates and returns a new Query with the additional filter that documents
   * must contain the specified field and the value should satisfy the
   * relation constraint provided.
   *
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created Query.
   */
  public where = (fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): Query<T> => {
    return new MockQuery(this as any, this.getDocs()).where(fieldPath, opStr, value);
  }

  /**
   * Creates and returns a new Query that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   *
   * @param fieldPath The field to sort by.
   * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
   * not specified, order will be ascending.
   * @return The created Query.
   */
  public orderBy = (fieldPath: string | FieldPath, directionStr?: OrderByDirection): Query => {
    return new MockQuery(this as any, this.getDocs()).orderBy(fieldPath, directionStr);
  }

  /**
   * Creates and returns a new Query that's additionally limited to only
   * return up to the specified number of documents.
   *
   * @param limit The maximum number of items to return.
   * @return The created Query.
   */
  public limit = (limit: number): Query<T> => {
    return new MockQuery<T>(this as any, this.getDocs()).limit(limit);
  }

  public limitToLast = (limit: number): Query<T> => {
    return new MockQuery<T>(this as any, this.getDocs()).limitToLast(limit);
  }
  /**
   * Creates and returns a new Query that starts at the provided document
   * (inclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query.
   *
   * @param snapshot The snapshot of the document to start at.
   * @param fieldValues The field values to start this query at, in order
   * @return The created Query.
   */
  // public startAt(snapshot: DocumentSnapshot): Query;
  // public startAt(...fieldValues: any[]): Query  {
  public startAt = (args: DocumentSnapshot | any[]) => {
    throw new MockQuery(this as any, this.getDocs()).startAt(args);
  }

  /**
   * Creates and returns a new Query that starts at the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to start this query at, in order
   * of the query's order by.
   * @return The created Query.
   */

  /**
   * Creates and returns a new Query that starts after the provided document
   * (exclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query.
   *
   * @param snapshot The snapshot of the document to start after.
   * @return The created Query.
   */
  // public startAfter(...fieldValues: any[]): Query;
  // public startAfter = (snapshot: DocumentSnapshot): Query=> {
  public startAfter = (args: DocumentSnapshot<T> | any[]) => {
    throw new MockQuery(this as any, this.getDocs()).startAfter(args);
  }

  /**
   * Creates and returns a new Query that starts after the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to start this query after, in order
   * of the query's order by.
   * @return The created Query.
   */

  /**
   * Creates and returns a new Query that ends before the provided document
   * (exclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   *
   * @param snapshot The snapshot of the document to end before.
   * @return The created Query.
   */
  // endBefore(snapshot: DocumentSnapshot): Query;

  /**
   * Creates and returns a new Query that ends before the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to end this query before, in order
   * of the query's order by.
   * @return The created Query.
   */
  // endBefore(...fieldValues: any[]): Query;
  public endBefore = (args: DocumentSnapshot | any[]) => {
    throw new MockQuery(this as any, this.getDocs()).endBefore(args);
  }
  /**
   * Creates and returns a new Query that ends at the provided document
   * (inclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   *
   * @param snapshot The snapshot of the document to end at.
   * @return The created Query.
   */
  // endAt(snapshot: DocumentSnapshot): Query;

  /**
   * Creates and returns a new Query that ends at the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to end this query at, in order
   * of the query's order by.
   * @return The created Query.
   */
  // endAt(...fieldValues: any[]): Query;
  public endAt = (...fieldValues: any[]): Query => {
    throw new MockQuery(this as any, this.getDocs()).endAt(fieldValues);
  }

  /**
   * Returns true if this `Query` is equal to the provided one.
   *
   * @param other The `Query` to compare against.
   * @return true if this `Query` is equal to the provided one.
   */
  // public isEqual = (other: Query): boolean => {
  //   throw new Error('Not implemented yet');
  // };

  /**
   * Executes the query and returns the results as a QuerySnapshot.
   *
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise that will be resolved with the results of the Query.
   */
  public get = async (options?: GetOptions): Promise<QuerySnapshot<T>> => {
    try {
      return Promise.resolve(new MockQuery(this as any, this.getDocs()).get());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Attaches a listener for QuerySnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param onNext A callback to be called every time a new `QuerySnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  public onSnapshot = (
    optionsOrObserverOrOnNext: SnapshotListenOptions | MockQuerySnapshotObserver | MockQuerySnapshotCallback,
    observerOrOnNextOrOnError?: MockQuerySnapshotObserver | MockQuerySnapshotCallback | ErrorFunction,
    onErrorOrOnCompletion?: ErrorFunction | MockSubscriptionFunction
  ): MockSubscriptionFunction => {
    if (typeof optionsOrObserverOrOnNext === 'function') {
      const callback = optionsOrObserverOrOnNext;
      const unsubscribe = () => {
        this._snapshotCallbackHandler.remove(callback);
      };
      this._snapshotCallbackHandler.add(callback);

      // Make the initial call to onSnapshot listener
      const documentChanges: DocumentChange<T>[] = this.getQueryDocumentSnapshots().map((snapshot, newIndex) => ({
        type: 'added',
        doc: snapshot as QueryDocumentSnapshot<T>,
        oldIndex: -1,
        newIndex,
      }));
      this.fireBatchDocumentChange(documentChanges);
      return unsubscribe;
    }
    throw new Error('Not implemented yet');
  }

  public fireBatchDocumentChange = (documentChanges: DocumentChange<T>[]) => {
    const docs = this.getQueryDocumentSnapshots();
    const querySnapshot = new MockQuerySnapshot(this, docs, documentChanges);
    this._snapshotCallbackHandler.fire(querySnapshot);
  }

  public withConverter = <U>(
    converter: FirestoreDataConverter<U>
  ): CollectionReference<U> => {
    throw new Error('Not implemented yet');
  }

  public mock = (): MockCollectionReference<T> => {
    return this as MockCollectionReference<T>;
  }

  public fireSubDocumentChange = (type: DocumentChangeType, snapshot: DocumentSnapshot<T>, oldIndex: number = -1) => {
    switch (type) {
      case 'modified':
        {
          const docs = this.getQueryDocumentSnapshots();
          const index = docs.findIndex(doc => doc.id === snapshot.id);
          const documentChanges: DocumentChange[] = [
            {
              type,
              doc: docs[index] as MockQueryDocumentSnapshot,
              oldIndex: index,
              newIndex: index,
            },
          ];
          const querySnapshot = new MockQuerySnapshot(this, docs, documentChanges);
          this._snapshotCallbackHandler.fire(querySnapshot);
        }
        break;

      case 'added':
        {
          const docs = this.getQueryDocumentSnapshots();
          const newIndex = docs.findIndex(doc => doc.id === snapshot.id);
          const documentChanges: DocumentChange[] = [
            {
              type,
              doc: snapshot as unknown as MockQueryDocumentSnapshot,
              oldIndex: -1,
              newIndex,
            },
          ];
          const querySnapshot = new MockQuerySnapshot(this, docs, documentChanges);
          this._snapshotCallbackHandler.fire(querySnapshot);
        }
        break;

      case 'removed':
        {
          const docs = this.getQueryDocumentSnapshots();
          const documentChanges: DocumentChange<T>[] = [
            {
              type,
              doc: snapshot as unknown as QueryDocumentSnapshot<T>,
              oldIndex,
              newIndex: -1,
            },
          ];
          const querySnapshot = new MockQuerySnapshot(this as any, docs, documentChanges);
          this._snapshotCallbackHandler.fire(querySnapshot);
        }
        break;

      default:
        throw new Error(`Unexpected change type: ${type}`);
    }
  }

  private getDocs(): MockDocumentReference<T>[] {
    return Object.getOwnPropertyNames(this._docRefs).map(docId => {
      return this._docRefs[docId];
    });
  }

  private getQueryDocumentSnapshots = (): QueryDocumentSnapshot[] => {
    const result: QueryDocumentSnapshot[] = [];
    Object.keys(this._docRefs).forEach(key => {
      if (this._docRefs[key] && this._docRefs[key].data) {
        result.push(new MockQueryDocumentSnapshot(this._docRefs[key]) as QueryDocumentSnapshot);
      }
    });
    return result;
  }
}
