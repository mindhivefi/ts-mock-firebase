import {
  CollectionReference,
  DocumentChangeType,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  FirebaseFirestore,
  FirestoreError,
  GetOptions,
  SetOptions,
  SnapshotListenOptions,
  UpdateData,
} from '@firebase/firestore-types';
import { MockCollectionReference } from 'firestore/MockCollectionReference';
import MockCallbackHandler from 'firestore/utils/CallbackHandler';
import { resolveReference } from 'firestore/utils/index';
import { MockFirebaseFirestore } from '.';
import { Mocker } from '../index';
import { MockDocument } from './index';
import MockDocumentSnapshot from './MockDocumentSnapshot';

export interface SnapshotObserver {
  next?: (snapshot: DocumentSnapshot) => void;
  error?: (error: FirestoreError) => void;
  complete?: () => void;
}

/**
 * Mocker class to change document's state directly without any further consequences. Mocker is used
 * to alter document's internal state for test use case
 */
export interface DocumentMocker extends Mocker {
  collection(id: string): MockCollectionReference;

  setCollection(collection: MockCollectionReference): void;

  load(document: MockDocument): void;

  listeners(): MockDocumentSnapshotCallback[];
}

export default class MockDocumentReference implements DocumentReference {
  // if data does not exists, the document will be treated is if it does not exists
  public data: any = undefined;

  private _collections: {
    [id: string]: MockCollectionReference;
  } = {};

  private _snapshotCallbackHandler = new MockCallbackHandler<DocumentSnapshot>();

  public mocker: DocumentMocker;

  /**
   *
   * @param firestore The `Firestore` for the Firestore database (useful for performing
   * transactions, etc.).
   * @param parent A reference to the Collection to which this DocumentReference belongs.
   */
  public constructor(public firestore: FirebaseFirestore, public id: string, public parent: CollectionReference) {
    this.mocker = {
      collection: (collectionId: string) => {
        return this._collections[collectionId];
      },

      setCollection: (collection: MockCollectionReference) => {
        this._collections[collection.id] = collection;
      },

      reset: () => {
        for (const collectionId in this._collections) {
          const collection = this._collections[collectionId];
          collection.mocker.reset();
        }
        this._collections = {};
        this._snapshotCallbackHandler.reset();
        this.data = undefined;
      },

      load: (document: MockDocument) => {
        this.mocker.reset();
        this.data = document.data ? { ...document.data } : undefined;

        const collections = document.collections;

        if (collections) {
          for (const collectionId in collections) {
            const collectionData = collections[collectionId];

            const collection = new MockCollectionReference(this.firestore as MockFirebaseFirestore, collectionId, this);
            this.mocker.setCollection(collection);
            collection.mocker.load(collectionData);
          }
        }

        const listeners = document.listerners;
        if (listeners) {
          this._snapshotCallbackHandler.load(listeners);
        }
      },

      listeners: () => {
        return this._snapshotCallbackHandler.list;
      },
    };
  }

  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  public get path(): string {
    return this.parent ? `${this.parent.path}/${this.id}` : this.id;
  }
  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  public collection = (collectionPath: string): CollectionReference => {
    return resolveReference(this.firestore as MockFirebaseFirestore, this, true, collectionPath) as CollectionReference;
  };

  /**
   * Returns true if this `DocumentReference` is equal to the provided one.
   *
   * @param other The `DocumentReference` to compare against.
   * @return true if this `DocumentReference` is equal to the provided one.
   */
  public isEqual = (other: DocumentReference): boolean => {
    return this === other;
  };

  /**
   * Writes to the document referred to by this `DocumentReference`. If the
   * document does not yet exist, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into an existing document.
   *
   * @param data A map of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  public set = async (data: DocumentData, options?: SetOptions) => {
    const changeType: DocumentChangeType = this.data ? 'modified' : 'added';
    if (options && options.merge) {
      this.data = { ...this.data, ...data };
    } else {
      this.data = { ...data };
    }

    const documentSnapshot = new MockDocumentSnapshot(this, this.data) as DocumentSnapshot;
    this._snapshotCallbackHandler.fire(documentSnapshot);
    (this.parent as MockCollectionReference).fireSubDocumentChange(changeType, documentSnapshot);
  };

  /**
   * Updates fields in the document referred to by this `DocumentReference`.
   * The update will fail if applied to a document that does not exist.
   *
   * @param data An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  public update = async (data: UpdateData | string | FieldPath, value?: any, ...moreFieldsAndValues: any[]) => {
    if (!this.data) {
      // TODO change to use actual exception
      throw new Error('No entity to update');
    }
    if (!value) {
      // only one parameter, so we treat it as UpdateData
      this.data = {
        ...this.data,
        ...(data as UpdateData),
      };
    } else {
      throw new Error('Update for name value pairs is not implemented yet.');
    }
    this.fireDocumentChangeEvent('modified');
  };

  /**
   * Updates fields in the document referred to by this `DocumentReference`.
   * The update will fail if applied to a document that does not exist.
   *
   * Nested fields can be updated by providing dot-separated field path
   * strings or by providing FieldPath objects.
   *
   * @param field The first field to update.
   * @param value The first value.
   * @param moreFieldsAndValues Additional key value pairs.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  // update(field: string | FieldPath, value: any, ...moreFieldsAndValues: any[]): Promise<void>;

  /**
   * Deletes the document referred to by this `DocumentReference`.
   *
   * @return A Promise resolved once the document has been successfully
   * deleted from the backend (Note that it won't resolve while you're
   * offline).
   */
  public delete = async () => {
    const callbaks = this._snapshotCallbackHandler.list;
    const oldIndex = (this.parent as MockCollectionReference).mocker.deleteDoc(this.id);
    this.data = undefined;
    // this._snapshotCallbackHandler.fire(new MockDocumentSnapshot(this, this.data) as DocumentSnapshot, listeners);

    this.fireDocumentChangeEvent('removed', oldIndex, callbaks);
    this.mocker.reset();
  };

  /**
   * Reads the document referred to by this `DocumentReference`.
   *
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise resolved with a DocumentSnapshot containing the
   * current document contents.
   */
  public get = async (options?: GetOptions): Promise<DocumentSnapshot> => {
    return new MockDocumentSnapshot(this, this.data);
  };

  /**
   * Attaches a listener for DocumentSnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param onNext A callback to be called every time a new `DocumentSnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot = (
    nextObservationOrOptions: SnapshotObserver | SnapshotListenOptions | MockDocumentSnapshotCallback,
    ObserverErrorOrNext?: SnapshotObserver | ErrorFunction | MockDocumentSnapshotCallback,
    completeOrError?: MockSubscriptionFunction | ErrorFunction,
    onComplete?: MockSubscriptionFunction,
  ): MockSubscriptionFunction => {
    if (typeof nextObservationOrOptions === 'function') {
      const callback = nextObservationOrOptions;
      const unsubscribe = () => {
        this._snapshotCallbackHandler.remove(callback);
      };
      this._snapshotCallbackHandler.add(callback);
      return unsubscribe;
    }
    throw new Error('Not implemented yet');
  };

  public fireDocumentChangeEvent = (
    changeType: DocumentChangeType,
    oldIndex: number = -1,
    callbacks?: MockDocumentSnapshotCallback[],
  ) => {
    const snapshot = new MockDocumentSnapshot(this, this.data) as DocumentSnapshot;
    (this.parent as MockCollectionReference).fireSubDocumentChange(changeType, snapshot, oldIndex);
    this._snapshotCallbackHandler.fire(snapshot, callbacks);
  };
}

export type MockSubscriptionFunction = () => void;
export type ErrorFunction = (error: Error) => void;
export type FirebaseErrorFunction = (error: FirestoreError) => void;
export type MockDocumentSnapshotCallback = (snapshot: DocumentSnapshot) => void;
