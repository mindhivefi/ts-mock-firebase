import * as types from '@firebase/firestore-types';
import {
  CollectionReference,
  DocumentReference,
} from '@firebase/firestore-types';
import { MockFirebaseApp } from 'firebaseApp';
import { MockCollectionReference } from 'firestore/MockCollectionReference';
import { Mocker } from '../index';
import MockDocumentReference from './MockDocumentReference';
import MockTransaction from 'firestore/MockTransaction';
import { MockDocumentSnapshotCallback } from './MockDocumentReference';
import { NotImplementedYet, resolveReference } from './utils/index';

declare module '@firebase/app-types' {
  interface FirebaseNamespace {
    firestore?: {
      (app?: FirebaseApp): types.FirebaseFirestore;
      Blob: typeof types.Blob;
      CollectionReference: typeof types.CollectionReference;
      DocumentReference: typeof types.DocumentReference;
      DocumentSnapshot: typeof types.DocumentSnapshot;
      FieldPath: typeof types.FieldPath;
      FieldValue: typeof types.FieldValue;
      Firestore: typeof types.FirebaseFirestore;
      GeoPoint: typeof types.GeoPoint;
      Query: typeof types.Query;
      QuerySnapshot: typeof types.QuerySnapshot;
      Timestamp: typeof types.Timestamp;
      Transaction: typeof types.Transaction;
      WriteBatch: typeof types.WriteBatch;
      setLogLevel: typeof types.setLogLevel;
    };
  }
  interface FirebaseApp {
    firestore?(): types.FirebaseFirestore;
  }
}

/**
 * Document object to define database data to be set into a mock
 */
export interface MockDocument {
  data?: types.DocumentData;
  collections?: MockCollections;
  listerners?: MockDocumentSnapshotCallback[];
}

export interface MockDocuments {
  [documentId: string]: MockDocument;
}

export interface MockCollection {
  docs?: MockDocuments;
  listeners?: any[]; // todo typing
}
/**
 * Collection object to define database data to be set into a mock
 */
export interface MockCollections {
  [collectionId: string]: MockCollection;
}

export type MockDatabase = MockCollections;

export interface FirestoreMocker extends Mocker {
  /**
   * Load the whole database from MockDatabase -object
   *
   * @param {MockDatabase} database Datbase model
   * @memberof FirestoreMocker
   */
  fromMockDatabase(database: MockDatabase): void;
  /**
   * Create a copy of the whole database
   *
   * @returns {MockDatabase}
   * @memberof FirestoreMocker
   */
  toMockDatabase(): MockDatabase;
  fromJson(json: string): void;
  toJson(): string;
}

/**
 * `Firestore` represents a Firestore Database and is the entry point for all
 * Firestore operations.
 */
export class MockFirebaseFirestore implements types.FirebaseFirestore {
  public readonly root: MockDocumentReference = new MockDocumentReference(
    this,
    '',
    null as any,
  );

  public mocker: FirestoreMocker;

  public constructor(app: MockFirebaseApp) {
    this.app = app;
    this.INTERNAL = {
      // delete: () => void,
    };

    this.mocker = {
      fromMockDatabase: (database: MockDatabase) => {
        this.root.mocker.reset();
        for (const collectionId in database) {
          const collectionData = database[collectionId];

          const collection = new MockCollectionReference(
            this,
            collectionId,
            this.root,
          );
          this.root.mocker.setCollection(collection);
          collection.mocker.load(collectionData);
        }
      },

      toMockDatabase: (): MockDatabase => {
        const database: MockDatabase = this.root.mocker.saveCollections();
        return database;
      },

      fromJson: (json: string) => {
        this.mocker.fromMockDatabase(JSON.parse(json));
      },

      toJson: () => {
        return JSON.stringify(this.mocker.toMockDatabase(), undefined, 2);
      },

      reset: () => {
        this.root.mocker.reset();
      },
    };
  }
  /**
   * Specifies custom settings to be used to configure the `Firestore`
   * instance. Must be set before invoking any other methods.
   *
   * @param settings The settings to use.
   */
  public settings = (settings: types.Settings): void => {
    throw new NotImplementedYet('MockFirebaseFirestore.settings');
  };

  /**
   * Attempts to enable persistent storage, if possible.
   *
   * Must be called before any other methods (other than settings()).
   *
   * If this fails, enablePersistence() will reject the promise it returns.
   * Note that even after this failure, the firestore instance will remain
   * usable, however offline persistence will be disabled.
   *
   * There are several reasons why this can fail, which can be identified by
   * the `code` on the error.
   *
   *   * failed-precondition: The app is already open in another browser tab.
   *   * unimplemented: The browser is incompatible with the offline
   *     persistence implementation.
   *
   * @param settings Optional settings object to configure persistence.
   * @return A promise that represents successfully enabling persistent
   * storage.
   */
  public enablePersistence = async (settings?: types.PersistenceSettings) => {
    throw new NotImplementedYet('MockFirebaseFirestore.enablePersistence');
  };

  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  public collection = (collectionPath: string): types.CollectionReference => {
    return resolveReference(
      this,
      this.root,
      true,
      collectionPath,
    ) as CollectionReference;
  };

  /**
   * Gets a `DocumentReference` instance that refers to the document at the
   * specified path.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  public doc = (documentPath: string): types.DocumentReference => {
    return resolveReference(
      this,
      this.root,
      false,
      documentPath,
    ) as DocumentReference;
  };

  /**
   * Executes the given updateFunction and then attempts to commit the
   * changes applied within the transaction. If any document read within the
   * transaction has changed, the updateFunction will be retried. If it fails
   * to commit after 5 attempts, the transaction will fail.
   *
   * @param updateFunction The function to execute within the transaction
   * context.
   * @return If the transaction completed successfully or was explicitly
   * aborted (by the updateFunction returning a failed Promise), the Promise
   * returned by the updateFunction will be returned here. Else if the
   * transaction failed, a rejected Promise with the corresponding failure
   * error will be returned.
   */
  public runTransaction = async <T>(
    updateFunction: (transaction: types.Transaction) => Promise<T>,
  ): Promise<T> => {
    const transaction = new MockTransaction(this);
    try {
      const result = await updateFunction(transaction);

      await transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      return error;
    }
  };

  /**
   * Creates a write batch, used for performing multiple writes as a single
   * atomic operation.
   */
  public batch = (): types.WriteBatch => {
    throw new NotImplementedYet('MockFirebaseFirestore.batch');
  };

  /**
   * The `FirebaseApp` associated with this `Firestore` instance.
   */
  public app: MockFirebaseApp;

  /**
   * Re-enables use of the network for this Firestore instance after a prior
   * call to disableNetwork().
   *
   * @return A promise that is resolved once the network has been enabled.
   */
  public enableNetwork = async () => {
    throw new NotImplementedYet('MockFirebaseFirestore.enableNetwork');
  };

  /**
   * Disables network usage for this instance. It can be re-enabled via
   * enableNetwork(). While the network is disabled, any snapshot listeners or
   * get() calls will return results from cache, and any write operations will
   * be queued until the network is restored.
   *
   * @return A promise that is resolved once the network has been disabled.
   */
  public disableNetwork = async () => {
    throw new NotImplementedYet('MockFirebaseFirestore.disableNetwork');
  };

  public INTERNAL: any;
}
