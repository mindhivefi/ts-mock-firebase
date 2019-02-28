import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  GetOptions,
  OrderByDirection,
  Query,
  QuerySnapshot,
  WhereFilterOp,
} from '@firebase/firestore-types';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
import { Mocker } from 'index';
import { FirestoreMock } from '.';
import { MockCollection } from './index';
import QueryMock from './QueryMock';
import { generateDocumentId, NotImplementedYet, resolveReference } from './utils/index';
import { querySortFunction } from './utils/sortings';

export interface CollectionMocker extends Mocker {
  doc(id: string): DocumentReferenceMock;

  setDoc(doc: DocumentReferenceMock): void;

  deleteDoc(id: string): void;

  load(collection: MockCollection): void;

  reset(): void;
}
export class CollectionReferenceMock implements CollectionReference {
  private _docs: {
    [documentId: string]: DocumentReferenceMock;
  } = {};

  public constructor(
    public firestore: FirestoreMock,
    public id: string,
    public parent: DocumentReference | null = null,
  ) {
    this.mocker = {
      doc: (documentId: string) => {
        return this._docs[documentId];
      },
      setDoc: (doc: DocumentReferenceMock) => {
        this._docs[doc.id] = doc;
      },

      deleteDoc: (documentId: string) => {
        delete this._docs[documentId];
      },

      load: (collection: MockCollection) => {
        this.mocker.reset();

        if (collection.docs) {
          for (const documentId in collection.docs) {
            const documentData = collection.docs[documentId];

            const document = new DocumentReferenceMock(this.firestore, documentId, this);
            this.mocker.setDoc(document);
            document.mocker.load(documentData);
          }
        }
      },

      reset: () => {
        for (const documentId in this._docs) {
          const doc = this._docs[documentId];
          doc.mocker.reset();
        }
        this._docs = {};
      },
    };
  }

  public mocker: CollectionMocker;

  /** The identifier of the collection. */
  // readonly id: string;

  /**
   * A reference to the containing Document if this is a subcollection, else
   * null.
   */
  // readonly parent: DocumentReference | null;

  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path(): string {
    return this.parent ? `${this.parent.path}/${this.id}` : this.id;
  }

  /**
   * Get a `DocumentReference` for the document within the collection at the
   * specified path. If no path is specified, an automatically-generated
   * unique ID will be used for the returned DocumentReference.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  public doc = (documentPath?: string): DocumentReference => {
    return resolveReference(
      this.firestore,
      this.parent as DocumentReferenceMock,
      false,
      documentPath || generateDocumentId(),
      false,
      this,
    ) as DocumentReference;
  };

  /**
   * Add a new document to this collection with the specified data, assigning
   * it a document ID automatically.
   *
   * @param data An Object containing the data for the new document.
   * @return A Promise resolved with a `DocumentReference` pointing to the
   * newly created document after it has been written to the backend.
   */
  public add = (data: DocumentData): Promise<DocumentReference> => {
    return new Promise<DocumentReference>((resolve, reject) => {
      const id = generateDocumentId();
      const document = new DocumentReferenceMock(this.firestore, id, this);
      this.mocker.setDoc(document);
      document.data = { ...data };
      resolve(document);
    });
  };

  /**
   * Returns true if this `CollectionReference` is equal to the provided one.
   *
   * @param other The `CollectionReference` to compare against.
   * @return true if this `CollectionReference` is equal to the provided one.
   */
  public isEqual = (other: CollectionReference | Query): boolean => {
    return this === other;
  };

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
  public where = (fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): Query => {
    throw new Error('Not implemented yet');
  };

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
    return new QueryMock(this, this.getDocs().sort(querySortFunction(fieldPath, directionStr)));
  };

  /**
   * Creates and returns a new Query that's additionally limited to only
   * return up to the specified number of documents.
   *
   * @param limit The maximum number of items to return.
   * @return The created Query.
   */
  public limit = (limit: number): Query => {
    throw new Error('Not implemented yet');
  };
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
    throw new Error('Not implemented yet');
  };

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
  public startAfter = (args: DocumentSnapshot | any[]) => {
    throw new Error('Not implemented yet');
  };

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
    throw new Error('Not implemented yet');
  };
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
    throw new NotImplementedYet();
  };

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
  public get = async (options?: GetOptions): Promise<QuerySnapshot> => {
    return new Promise<QuerySnapshot>((resolve, reject) => {
      resolve(new QueryMock(this, this.getDocs()).get());
    });
  };

  private getDocs(): DocumentReferenceMock[] {
    return Object.getOwnPropertyNames(this._docs).map(docId => {
      return this._docs[docId];
    });
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
  // onSnapshot(observer: {
  //   next?: (snapshot: QuerySnapshot) => void;
  //   error?: (error: Error) => void;
  //   complete?: () => void;
  // }): () => void;
  // onSnapshot(
  //   options: SnapshotListenOptions,
  //   observer: {
  //     next?: (snapshot: QuerySnapshot) => void;
  //     error?: (error: Error) => void;
  //     complete?: () => void;
  //   },
  // ): () => void;
  // onSnapshot(
  //   onNext: (snapshot: QuerySnapshot) => void,
  //   onError?: (error: Error) => void,
  //   onCompletion?: () => void,
  // ): () => void;
  // onSnapshot(
  //   options: SnapshotListenOptions,
  //   onNext: (snapshot: QuerySnapshot) => void,
  //   onError?: (error: Error) => void,
  //   onCompletion?: () => void,
  // ): () => void;
  onSnapshot = (): (() => void) => {
    throw new Error('Not implemented yet');
  };
}
