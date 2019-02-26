import * as types from '@firebase/firestore-types';
import { FirebaseAppMock } from 'firebaseApp';
import { CollectionReferenceMock } from './CollectionReferenceMock';

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

export class FirestoreMock implements types.FirebaseFirestore {
  public constructor(app: FirebaseAppMock) {
    this.app = app;
    this.INTERNAL = {
      // delete: () => void,
    };
  }
  /**
   * Specifies custom settings to be used to configure the `Firestore`
   * instance. Must be set before invoking any other methods.
   *
   * @param settings The settings to use.
   */
  public settings = (settings: types.Settings): void => {
    throw new Error('Not implemented yet');
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
  public enablePersistence = async (settings?: types.PersistenceSettings) => {};

  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  public collection = (collectionPath: string): types.CollectionReference => {
    return new CollectionReferenceMock(this, collectionPath);
  };

  /**
   * Gets a `DocumentReference` instance that refers to the document at the
   * specified path.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  public doc = (documentPath: string): types.DocumentReference => {
    throw new Error('Not implemented yet');
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
  public runTransaction = <T>(updateFunction: (transaction: types.Transaction) => Promise<T>): Promise<T> => {
    throw new Error('Not implemented yet');
  };

  /**
   * Creates a write batch, used for performing multiple writes as a single
   * atomic operation.
   */
  public batch = (): types.WriteBatch => {
    throw new Error('Not implemented yet');
  };

  /**
   * The `FirebaseApp` associated with this `Firestore` instance.
   */
  public app: FirebaseAppMock;

  /**
   * Re-enables use of the network for this Firestore instance after a prior
   * call to disableNetwork().
   *
   * @return A promise that is resolved once the network has been enabled.
   */
  public enableNetwork = async () => {
    throw new Error('Not implemented yet');
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
    throw new Error('Not implemented yet');
  };

  public INTERNAL: any;
}
