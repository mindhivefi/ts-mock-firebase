import {
  CollectionReference,
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
import { CollectionReferenceMock } from 'firestore/CollectionReferenceMock';
import { FirestoreMock } from '.';
import { Mocker } from '../index';
import DocumentSnapshotMock from './DocumentSnapshotMock';
import { MockDocument } from './index';
import { resolveReference } from './utils/index';

export interface SnaphotObserver {
  next?: (snapshot: DocumentSnapshot) => void;
  error?: (error: FirestoreError) => void;
  complete?: () => void;
}

/**
 * Mocker class to change document's state directly without any further consequences. Mocker is used
 * to alter document's internal state for test use case
 */
export interface DocumentMocker extends Mocker {
  collection(id: string): CollectionReferenceMock;

  setCollection(collection: CollectionReferenceMock): void;

  load(document: MockDocument): void;

  listeners(): DocumentSnapshotFunction[];
}

export default class DocumentReferenceMock implements DocumentReference {
  // if data does not exists, the document will be treated is if it does not exists
  public data: any = undefined;

  private _collections: {
    [id: string]: CollectionReferenceMock;
  } = {};

  private _snapshotListeners: DocumentSnapshotFunction[] = [];

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

      setCollection: (collection: CollectionReferenceMock) => {
        this._collections[collection.id] = collection;
      },

      reset: () => {
        for (const collectionId in this._collections) {
          const collection = this._collections[collectionId];
          collection.mocker.reset();
        }
        this._collections = {};
        this._snapshotListeners = [];
        this.data = undefined;
      },

      load: (document: MockDocument) => {
        this.mocker.reset();
        this.data = document.data ? { ...document.data } : undefined;

        const collections = document.collections;

        if (collections) {
          for (const collectionId in collections) {
            const collectionData = collections[collectionId];

            const collection = new CollectionReferenceMock(this.firestore as FirestoreMock, collectionId, this);
            this.mocker.setCollection(collection);
            collection.mocker.load(collectionData);
          }
        }

        const listeners = document.listerners;
        if (listeners) {
          this._snapshotListeners = listeners.slice();
        }
      },

      listeners: () => {
        return this._snapshotListeners.slice();
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
    return resolveReference(this.firestore as FirestoreMock, this, true, collectionPath) as CollectionReference;
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
    this.data = { ...data };

    this.fireSnapshowListeners(new DocumentSnapshotMock(this, this.data));
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
    if (!value) {
      // only one parameter, so we treat it as UpdateData
      this.data = {
        ...this.data,
        ...(data as UpdateData),
      };
    } else {
      throw new Error('Update for name value pairs is not implemented yet.');
    }
    this.fireSnapshowListeners(new DocumentSnapshotMock(this, this.data));
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
    const listeners = this._snapshotListeners.slice();
    (this.parent as CollectionReferenceMock).mocker.deleteDoc(this.id);
    this.data = undefined;
    this.fireSnapshowListeners(new DocumentSnapshotMock(this, undefined), listeners);

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
    return new DocumentSnapshotMock(this, this.data);
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
    nextObservationOrOptions: SnaphotObserver | SnapshotListenOptions | DocumentSnapshotFunction,
    ObserverErrorOrNext?: SnaphotObserver | ErrorFunction | DocumentSnapshotFunction,
    completeOrError?: SubscriptionFunction | ErrorFunction,
    onComplete?: SubscriptionFunction,
  ): SubscriptionFunction => {
    if (typeof nextObservationOrOptions === 'function') {
      const listener = nextObservationOrOptions;
      const unsubscribe = () => {
        this.removeListener(listener);
      };
      this._snapshotListeners.push(listener);
      return unsubscribe;
    }
    throw new Error('Not implemented yet');
  };

  private removeListener = (listener: DocumentSnapshotFunction) => {
    const index = this._snapshotListeners.findIndex(item => item === listener);
    if (index >= 0) {
      this._snapshotListeners.splice(index, 1);
    }
  };

  private fireSnapshowListeners = (
    snapshot: DocumentSnapshotMock,
    listeners: DocumentSnapshotFunction[] = this._snapshotListeners,
  ) => {
    for (const listener of listeners) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(`Error on onSnapshot -event handler in document: ${this.path}: ${error}.`);
      }
    }
  };
}

export type SubscriptionFunction = () => void;
export type ErrorFunction = (error: Error) => void;
export type FirebaseErrorFunction = (error: FirestoreError) => void;
export type DocumentSnapshotFunction = (snapshot: DocumentSnapshot) => void;
