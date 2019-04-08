import { MockFirebaseApp, MockFirebaseFirestore, MockFirebaseService } from '@firebase/app-types';
import * as types from '@firebase/firestore-types';
import createFirebaseRulesIntepreter, {
  defaultFirebaseRulesContext,
  FirebaseRulesContext,
} from 'firebase-rules-parser';
import { FirebaseRulesIntepreter } from 'firebase-rules-parser';
import * as fs from 'fs';

import { hash } from '../utils/stringUtils';
import { FirestoreMocker } from './FirestoreMocker';
import { MockCollectionReference } from './MockCollectionReference';
import MockDocumentReference, { MockDocumentSnapshotCallback } from './MockDocumentReference';
import { MockTimestamp } from './MockTimestamp';
import MockTransaction from './MockTransaction';
import { MockWriteBatch } from './MockWritebatch';
import { generateDocumentId, isValidCollectionReference, isValidDocumentReference, resolveReference } from './utils';
import { NotImplementedYet } from './utils/NotImplementedYet';

/**
 * Document object to define database data to be set into a mock
 */
export interface MockDocument {
  data?: types.DocumentData;
  collections?: MockCollections;
  listerners?: MockDocumentSnapshotCallback[];
}

/**
 * A collection of documents in mock database
 */
export interface MockDocuments {
  [documentId: string]: MockDocument;
}

/**
 * Mock Collection object defining documents and listeners that belong to collection
 */
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

export type MockTimestampFunction = () => MockTimestamp;

export interface CollectionObject {
  [documentId: string]: types.DocumentData;
}
/**
 * `Firestore` represents a Firestore Database and is the entry point for all
 * Firestore operations.
 */
export class MockFirebaseFirestoreImpl implements MockFirebaseFirestore, MockFirebaseService {
  public get rules(): FirebaseRulesIntepreter | undefined {
    return this._rules;
  }
  /**
   * Mocker object for reading and writing the whole firestore's state without indirect effects. This is a basic tool
   * for setting up the test setup for an unit test.
   */
  public mocker: FirestoreMocker;

  /**
   * The `FirebaseApp` associated with this `Firestore` instance.
   */
  public app: MockFirebaseApp;

  public INTERNAL: any;
  private readonly root: MockDocumentReference = new MockDocumentReference(this, '', null as any);

  private _settings?: types.Settings;

  private _rules?: FirebaseRulesIntepreter;
  private _rulesHash?: number;
  private _nextDocumentIds: string[] = [];

  // tslint:disable-next-line: cognitive-complexity
  public constructor(app: MockFirebaseApp) {
    this.app = app;
    this.INTERNAL = {
      // delete: () => void
    };

    const firestore = this;

    // TODO Refactor to own internal class
    this.mocker = {
      serverTime: undefined,

      root: () => this.root,

      fromMockDatabase: (database: MockDatabase) => {
        this.root.mocker.reset();
        for (const collectionId in database) {
          if (database.hasOwnProperty(collectionId)) {
            const collectionData = database[collectionId];

            const collection = new MockCollectionReference(this, collectionId, this.root);
            this.root.mocker.setCollection(collection);
            collection.mocker.load(collectionData);
          }
        }
      },

      toMockDatabase: (): MockDatabase => {
        return this.root.mocker.saveCollections();
      },

      fromJson: (json: string) => {
        this.mocker.fromMockDatabase(JSON.parse(json));
      },

      toJson: () => {
        return JSON.stringify(this.mocker.toMockDatabase(), undefined, 2);
      },

      reset: () => {
        this.root.mocker.reset();
        this._rules = undefined;
        this._rulesHash = undefined;
      },

      collection: (id: string): MockCollectionReference => {
        return this.root.mocker.collection(id);
      },

      setCollection: (collection: MockCollectionReference) => {
        this.root.mocker.setCollection(collection);
      },
      loadCollection: (collectionPath: string, collectionData: CollectionObject) => {
        if (!isValidCollectionReference(collectionPath)) {
          throw new Error(`Invalid collection reference: ${collectionPath}`);
        }

        const collection = this.root.collection(collectionPath) as MockCollectionReference;
        for (const docId in collectionData) {
          if (collectionData.hasOwnProperty(docId)) {
            const doc = new MockDocumentReference(firestore, docId, collection);
            doc.mocker.setData(collectionData[docId]);
            collection.mocker.setDoc(doc);
          }
        }
      },

      loadDocument: (documentPath: string, data: types.DocumentData) => {
        if (!isValidDocumentReference(documentPath)) {
          throw new Error(`Invalid document reference: ${documentPath}`);
        }

        const index = documentPath.indexOf('/');
        const rootCollection = documentPath.substring(0, index);
        const path = documentPath.substring(index + 1);

        const doc = this.root.collection(rootCollection).doc(path) as MockDocumentReference;

        doc.mocker.setData(data);
      },

      loadRulesFromString: (sourceFile: string): void => {
        const hashValue = hash(sourceFile);
        // avoid parsing if the file is already loaded
        if (hashValue !== this._rulesHash) {
          this._rules = createFirebaseRulesIntepreter();
          this._rules.init(sourceFile);
          this._rulesHash = hashValue;
        }
      },

      loadRulesFromFile: (filePath?: string): void => {
        const path = filePath || require('app-root-path') + 'firebase.rules';
        const sourceCode = fs.readFileSync(path, 'utf-8');
        this.mocker.loadRulesFromString(sourceCode);
      },

      rules: () => {
        return this.rules;
      },

      getRulesContext: (resource: MockDocumentReference): FirebaseRulesContext => {
        const context = defaultFirebaseRulesContext;
        context.resource = resource;
        context.auth = {}; // TODO fix auth
        context.onExistsCall = this.existCall;
        context.onGetCall = this.onGetCall;
        return context as any;
      },

      setNextDocumentIds: (ids: string[]) => {
        this._nextDocumentIds = ids;
      },

      getNextDocumentId: (): string => {
        if (this._nextDocumentIds.length > 0) {
          return this._nextDocumentIds.shift() as string;
        }
        return generateDocumentId();
      },
    };
  }

  public readSettings = (): types.Settings | undefined => {
    return this._settings;
  }
  /**
   * Specifies custom settings to be used to configure the `Firestore`
   * instance. Must be set before invoking any other methods.
   *
   * @param settings The settings to use.
   */
  public settings = (settings: types.Settings): void => {
    this._settings = settings;
  }

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
  }

  /**
   * Gets a `CollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `CollectionReference` instance.
   */
  public collection = (collectionPath: string): MockCollectionReference => {
    return resolveReference(this, this.root, true, collectionPath) as MockCollectionReference;
  }

  /**
   * Gets a `DocumentReference` instance that refers to the document at the
   * specified path.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  public doc = (documentPath: string): MockDocumentReference => {
    return resolveReference(this, this.root, false, documentPath) as MockDocumentReference;
  }

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
  public runTransaction = async <T>(updateFunction: (transaction: MockTransaction) => Promise<T>): Promise<T> => {
    const transaction = new MockTransaction(this);
    try {
      const result = await updateFunction(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      return error;
    }
  }

  /**
   * Creates a write batch, used for performing multiple writes as a single
   * atomic operation.
   */
  public batch = (): MockWriteBatch => {
    return new MockWriteBatch(this);
  }

  /**
   * Re-enables use of the network for this Firestore instance after a prior
   * call to disableNetwork().
   *
   * @return A promise that is resolved once the network has been enabled.
   */
  public enableNetwork = async () => {
    throw new NotImplementedYet('MockFirebaseFirestore.enableNetwork');
  }

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
  }

  private existCall = (path: string): boolean => {
    return false;
  }

  private onGetCall = (path: string): any => {
    return {};
  }
}

export { MockFieldPath } from './MockFieldPath';
export { MockFieldValue } from './MockFieldValue';
export { MockGeoPoint } from './MockGeoPoint';
export { MockTimestamp } from './MockTimestamp';
export { MockBlob } from './MockBlob';
