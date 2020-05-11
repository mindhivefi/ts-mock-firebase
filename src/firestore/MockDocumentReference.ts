import {
  CollectionReference,
  DocumentChangeType,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  FirestoreError,
  GetOptions,
  SetOptions,
  SnapshotListenOptions,
  UpdateData,
  FirestoreDataConverter,
} from '@firebase/firestore-types';

import { MockFirebaseFirestore } from '@firebase/app-types';
import { MockCollections, MockDocument, Mocker } from '../app';
import { deepCopy } from '../utils/deepCopy';
import { MockCollectionReference } from './MockCollectionReference';
import MockDocumentSnapshot from './MockDocumentSnapshot';
import { MockFieldPath } from './MockFieldPath';
import { preprocessData } from './MockFieldValue';
import { MockDocumentChange } from './MockTransaction';
import {
  MockFirebaseValidationError,
  parseFieldValuePairsFromArgs,
  resolveReference,
  setFieldValuePairs,
} from './utils';
import MockCallbackHandler from './utils/CallbackHandler';
import { processAndDeepMerge } from './utils/manipulation';
import { NotImplementedYet } from './utils/NotImplementedYet';

const MESSAGE_NO_ENTRY_TO_UPDATE = 'No entity to update';

export type MockFirestoreFieldPair = [string | FieldPath, any];

export interface SnapshotObserver<T> {
  next?: (snapshot: DocumentSnapshot<T>) => void;
  error?: (error: FirestoreError) => void;
  complete?: () => void;
}

/**
 * Mocker class to change document's state directly without any further consequences. Mocker is used
 * to alter document's internal state for test use case
 */
export interface DocumentMocker<T = DocumentData> extends Mocker {
  collection(id: string): MockCollectionReference<T>;

  setCollection(collection: MockCollectionReference<T>): void;

  load(document: MockDocument<T>): void;

  /**
   * Set document data object
   * @param data A new data for document
   */
  setData(data: T): void;

  getData(): T | undefined;

  saveDocument(): MockDocument<T>;

  saveCollections(): MockCollections<T>;

  listeners(): MockDocumentSnapshotCallback[];
}

export default class MockDocumentReference<T = DocumentData> implements DocumentReference<DocumentData> {
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  public get path(): string {
    return this.parent ? `${this.parent.path}/${this.id}` : this.id;
  }

  public get data(): T {
    return deepCopy(this._data) as T;
  }

  public mocker: DocumentMocker<T>;
  // if data does not exists, the document will be treated is if it does not exists

  private _data?: T;

  private _collections: {
    [id: string]: MockCollectionReference<T>;
  } = {};

  private _snapshotCallbackHandler = new MockCallbackHandler<MockDocumentSnapshot<T>>();

  /**
   *
   * @param firestore The `Firestore` for the Firestore database (useful for performing
   * transactions, etc.).
   * @param parent A reference to the Collection to which this DocumentReference belongs.
   */
  // tslint:disable-next-line
  public constructor(public firestore: MockFirebaseFirestore, public id: string,
    public parent: CollectionReference) {

    const me = this;

    this.mocker = {
      collection: (collectionId: string) => {
        return me._collections[collectionId];
      },

      setCollection: (collection: MockCollectionReference<T>) => {
        me._collections[collection.id] = collection;
      },

      getData: (): T | undefined => {
        return me.data ? deepCopy(me.data) : undefined;
      },

      setData: (data: T) => {
        me._data = data;
      },

      reset: () => {
        for (const collectionId in me._collections) {
          if (this._collections.hasOwnProperty(collectionId)) {
            const collection = me._collections[collectionId];
            collection.mocker.reset();
          }
        }
        me._collections = {};
        me._snapshotCallbackHandler.reset();
        me._data = undefined;
      },

      load: (document: MockDocument<T>) => {
        me.mocker.reset();
        me._data = deepCopy(document.data);

        const collections = document.collections;

        if (collections) {
          for (const collectionId in collections) {
            if (collections.hasOwnProperty(collectionId)) {
              const collectionData = collections[collectionId];

              const collection = new MockCollectionReference<T>(me.firestore, collectionId, me);
              this.mocker.setCollection(collection);
              collection.mocker.load(collectionData);
            }
          }
        }

        const listeners = document.listerners;
        if (listeners) {
          me._snapshotCallbackHandler.load(listeners);
        }
      },

      saveCollections: (): MockCollections<T> => {
        const result: MockCollections<T> = {};
        for (const collectionId in me._collections) {
          if (me._collections.hasOwnProperty(collectionId)) {
            const collection = me._collections[collectionId];
            result[collectionId] = collection.mocker.save();
          }
        }
        return result;
      },

      saveDocument: (): MockDocument<T> => {
        const result: MockDocument<T> = {
          data: { ...me.data }, // TODO deep copy
        };
        const collectionKeys = Object.getOwnPropertyNames(me._collections);
        if (collectionKeys.length > 0) {
          const collections = me.mocker.saveCollections();
          if (collections) {
            result.collections = collections;
          }
        }
        return result;
      },

      listeners: () => {
        return me._snapshotCallbackHandler.list as any;
      },
    };
  }
  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  public collection = (collectionPath: string): CollectionReference<T> => {
    return resolveReference(this.firestore, this as any, true, collectionPath) as unknown as CollectionReference<T>;
  }

  /**
   * Returns true if this `DocumentReference` is equal to the provided one.
   *
   * @param other The `DocumentReference` to compare against.
   * @return true if this `DocumentReference` is equal to the provided one.
   */
  public isEqual = (other: DocumentReference<T>): boolean => {
    return (this as any) === other;
  }

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
  public set = async (data: T, options?: SetOptions) => {
    const changeType: DocumentChangeType = this.data ? 'modified' : 'added';

    await this._set(data, options);

    const documentSnapshot = new MockDocumentSnapshot(this, this.data);
    this._snapshotCallbackHandler.fire(documentSnapshot as any);
    (this.parent as MockCollectionReference).fireSubDocumentChange(changeType, documentSnapshot as any);
  }

  public setInTransaction = (
    transactioData: DocumentData,
    setData: DocumentData,
    options?: SetOptions
  ): DocumentData => {
    return options && options.merge
      ? preprocessData(this.firestore, { ...transactioData, ...setData })
      : preprocessData(this.firestore, setData);
  }

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
  public update = async (
    // tslint:disable-next-line
    data: UpdateData | string | FieldPath,
    value?: any,
    ...moreFieldsAndValues: any[]
  ) => {
    if (!this._data) {
      // TODO change to use actual exception
      throw new MockFirebaseValidationError(MESSAGE_NO_ENTRY_TO_UPDATE);
    }
    await this._update(true, data, value, ...moreFieldsAndValues);
  }

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
  public updateInTransaction = (
    transactionData: DocumentData,
    data: UpdateData | string | FieldPath,
    value?: any,
    ...moreFieldsAndValues: any[]
  ): DocumentData => {
    if (!transactionData) {
      // TODO change to use actual exception
      throw new Error('No entity to update');
    }
    if (typeof data === 'string' || data instanceof MockFieldPath) {
      const args = parseFieldValuePairsFromArgs([data, value], moreFieldsAndValues);
      return setFieldValuePairs(this.firestore, transactionData, args);
    } else {
      // only one parameter, so we treat it as UpdateData
      const args = extractArguments(data);
      return setFieldValuePairs(this.firestore, transactionData, args);
      // return processAndDeepMerge(this.firestore, transactionData, data);
    }
  }

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
    return this._delete(true);
  }

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
  public get = async (options?: GetOptions): Promise<DocumentSnapshot<T>> => {
    return new MockDocumentSnapshot<T>(this as any, this.data);
  }

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
  public onSnapshot = <T = DocumentData>(
    nextObservationOrOptions: SnapshotObserver<T> | SnapshotListenOptions | MockDocumentSnapshotCallback,
    ObserverErrorOrNext?: SnapshotObserver<T> | ErrorFunction | MockDocumentSnapshotCallback,
    completeOrError?: MockSubscriptionFunction | ErrorFunction,
    onComplete?: MockSubscriptionFunction
  ): MockSubscriptionFunction => {
    if (typeof nextObservationOrOptions === 'function') {
      const callback = nextObservationOrOptions;
      const unsubscribe = () => {
        this._snapshotCallbackHandler.remove(callback);
      };
      this._snapshotCallbackHandler.add(callback);

      // Make the initial call to onSnapshot listener
      const snapshot = new MockDocumentSnapshot(this, this.data);
      this._snapshotCallbackHandler.fire(snapshot as any, [callback]);
      return unsubscribe;
    }
    throw new NotImplementedYet('onSnapshot');
  }

  public withConverter = <U>(converter: FirestoreDataConverter<U>): DocumentReference<U> => {
    throw new NotImplementedYet('withConverter')
  }

  public fireDocumentChangeEvent = (
    changeType: DocumentChangeType,
    oldIndex: number = -1,
    cascade: boolean = true,
    callbacks?: MockDocumentSnapshotCallback[]
  ) => {
    const snapshot = new MockDocumentSnapshot<T>(this as any, this.data);
    cascade && (this.parent as MockCollectionReference).fireSubDocumentChange(changeType, snapshot, oldIndex);
    this._snapshotCallbackHandler.fire(snapshot as any, callbacks);
  }

  public mock = (): MockDocumentReference<T> => {
    return this as MockDocumentReference<T>;
  }

  public commitChange = async (type: DocumentChangeType, value: any): Promise<MockDocumentChange> => {
    switch (type) {
      case 'added':
      case 'modified': // To make deletation work, we must treat modify as a set of object on commit
        await this._set(value); // TODO options
        return {
          type,
          doc: new MockDocumentSnapshot(this, {
            ...value,
          }),
          newIndex: -1,
          oldIndex: -1,
        } as any; // TODO typing

      case 'removed':
        await this._delete(false); // TODO FIeld paths etc
        return {
          type,
          doc: new MockDocumentSnapshot(this, {
            ...value,
          }),
          newIndex: -1,
          oldIndex: -1,
        } as any; // TODO typing
      default:
        throw new Error(`Unidentified change type ${type}.`);
    }
  }

  /**
   * Private set -method used inside and outside of transaction
   *
   * @private
   * @memberof MockDocumentReference
   */
  private _set = async (data: T, options?: SetOptions) => {
    if (options && options.merge) {
      this._data = processAndDeepMerge(this.firestore, this.data, data);
    } else {
      this._data = preprocessData(this.firestore, data);
    }
  }

  private _update = async (
    fireCallbacks: boolean,
    data: UpdateData | string | MockFieldPath,
    value?: any,
    ...moreFieldsAndValues: any[]
  ) => {
    if (!this._data) {
      // TODO change to use actual exception
      throw new MockFirebaseValidationError(MESSAGE_NO_ENTRY_TO_UPDATE);
    }
    if (typeof data === 'string' || data instanceof MockFieldPath) {
      const args = parseFieldValuePairsFromArgs([data, value], moreFieldsAndValues);
      this._data = setFieldValuePairs(this.firestore, this.data, args);
    } else if (typeof data === 'object') {
      // only one parameter, so we treat it as UpdateData
      const args: any[] = extractArguments(data);
      this._data = setFieldValuePairs(this.firestore, this._data, args);
    } else {
      throw new Error('Unsupported data type: ' + typeof data);
    }
    fireCallbacks && this.fireDocumentChangeEvent('modified');
  }

  private _delete = async (fireCallbacks: boolean) => {
    const callbacks = this._snapshotCallbackHandler.list;
    const oldIndex = (this.parent as MockCollectionReference).mocker.deleteDoc(this.id);

    fireCallbacks && this.fireDocumentChangeEvent('removed', oldIndex, true, callbacks as any);

    // remove data after triggering events
    this._data = undefined;
    this.mocker.reset(); // TODO this must be tested how this will act with a real Firestore. Collections are not removed?
  }
}

export function extractArguments(data: UpdateData) {
  const args: any[] = [];
  const fieldNames = Object.getOwnPropertyNames(data);
  for (const fieldName of fieldNames) {
    const fieldValue = data[fieldName];
    if (fieldName.includes('.')) {
      const paths = fieldName.split('.');
      args.push(new MockFieldPath(...paths));
    } else {
      args.push(fieldName);
    }
    args.push(fieldValue);
  }
  return args;
}

export type MockSubscriptionFunction = () => void;
export type ErrorFunction = (error: Error) => void;
export type FirebaseErrorFunction = (error: FirestoreError) => void;
export type MockDocumentSnapshotCallback = <T = any>(snapshot: MockDocumentSnapshot<T>) => void;
