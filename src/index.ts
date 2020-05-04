import { MockFirebaseApp, MockFirebaseNamespace } from '@firebase/app-types';
import * as types from '@firebase/firestore-types';
import { Observer, Subscribe } from '@firebase/util';
import {
  createFirebaseNamespace,
  DEFAULT_ENTRY_NAME,
  MockBlob,
  MockFieldPath,
  MockFieldValue,
  MockFirebaseAppImpl,
  MockFirebaseError,
  MockGeoPoint,
  MockTimestamp,
} from './app';
import { FirestoreMocker } from './firestore/FirestoreMocker';
import { MockCollectionReference } from './firestore/MockCollectionReference';
import MockDocumentReference from './firestore/MockDocumentReference';
import MockDocumentSnapshot from './firestore/MockDocumentSnapshot';
import MockQuery from './firestore/MockQuery';
import MockQuerySnapshot from './firestore/MockQuerySnapshot';
import MockTransaction from './firestore/MockTransaction';
import { MockWriteBatch } from './firestore/MockWritebatch';

import * as firestore from './firestore';

// TODO default export is the default app

// module level function for firestore()

declare module '@firebase/app-types' {
  export interface MockFirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    [name: string]: any;
  }

  export interface MockFirebaseApp {
    /**
     * The (read-only) name (identifier) for this App. '[DEFAULT]' is the default
     * App.
     */
    name: string;

    /**
     * The (read-only) configuration options from the app initialization.
     */
    options: MockFirebaseOptions;

    /**
     * The settable config flag for GDPR opt-in/opt-out
     */
    automaticDataCollectionEnabled: boolean;

    /**
     * Make the given App unusable and free resources.
     */
    delete(): Promise<void>;

    firestore(): MockFirebaseFirestore;
  }

  /**
   * `Firestore` represents a Firestore Database and is the entry point for all
   * Firestore operations.
   */
  export class MockFirebaseFirestore implements types.FirebaseFirestore {
    /**
     * The `FirebaseApp` associated with this `Firestore` instance.
     */
    public app: MockFirebaseApp;

    public mocker: FirestoreMocker;

    public INTERNAL: { delete: () => Promise<void> };
    private constructor(app: MockFirebaseApp);
    /**
     * Specifies custom settings to be used to configure the `Firestore`
     * instance. Must be set before invoking any other methods.
     *
     * @param settings The settings to use.
     */
    public settings(settings: types.Settings): void;

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
    public enablePersistence(settings?: types.PersistenceSettings): Promise<void>;

    /**
     * Gets a `CollectionRefeai sorence` instance that refers to the collection at
     * the specified path.
     *
     * @param collectionPath A slash-separated path to a collection.
     * @return The `CollectionReference` instance.
     */
    public collection<T = types.DocumentData>(collectionPath: string): MockCollectionReference<T>;

    /**
     * Gets a `DocumentReference` instance that refers to the document at the
     * specified path.
     *
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    public doc<T = types.DocumentData>(documentPath: string): MockDocumentReference<T>;

    /*
     * Creates and returns a new Query that includes all documents in the
     * database that are contained in a collection or subcollection with the
     * given collectionId.
     *
     * @param collectionId Identifies the collections to query over. Every
     * collection or subcollection with this ID as the last segment of its path
     * will be included. Cannot contain a slash.
     * @return The created Query.
     */
    public collectionGroup(collectionId: string): MockQuery<types.DocumentData>;

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
    public runTransaction<T>(updateFunction: (transaction: MockTransaction) => Promise<T>): Promise<T>;

    /**
     * Creates a write batch, used for performing multiple writes as a single
     * atomic operation.
     */
    public batch(): MockWriteBatch;

    /**
     * Re-enables use of the network for this Firestore instance after a prior
     * call to disableNetwork().
     *
     * @return A promise that is resolved once the network has been enabled.
     */
    public enableNetwork(): Promise<void>;

    /**
     * Disables network usage for this instance. It can be re-enabled via
     * enableNetwork(). While the network is disabled, any snapshot listeners or
     * get() calls will return results from cache, and any write operations will
     * be queued until the network is restored.
     *
     * @return A promise that is resolved once the network has been disabled.
     */
    public disableNetwork(): Promise<void>;

    public clearPersistence(): Promise<void>;

    onSnapshotsInSync(observer: {
      next?: (value: void) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }): () => void;

    onSnapshotsInSync(onSync: () => void): () => void;

    waitForPendingWrites(): Promise<void>;
    terminate(): Promise<void>;
  }
  export interface MockFirebaseNamespace {
    app: {
      /**
       * Retrieve an instance of a FirebaseApp.
       *
       * Usage: firebase.app()
       *
       * @param name The optional name of the app to return ('[DEFAULT]' if omitted)
       */
      (name?: string): MockFirebaseApp;

      /**
       * For testing FirebaseApp instances:
       *  app() instanceof firebase.app.App
       *
       * DO NOT call this constuctor directly (use firebase.app() instead).
       */
      App: typeof MockFirebaseAppImpl;
    };

    /**
     * A (read-only) array of all the initialized Apps.
     */
    apps: MockFirebaseApp[];

    // Inherit the type information of our exported Promise implementation from
    // es6-promises.
    Promise: typeof Promise;

    // The current SDK version.
    SDK_VERSION: string;

    firestore: {
      (app?: MockFirebaseApp): MockFirebaseFirestore;
      Blob: typeof MockBlob;
      CollectionReference: typeof MockCollectionReference;
      DocumentReference: typeof MockDocumentReference;
      DocumentSnapshot: typeof MockDocumentSnapshot;
      FieldPath: typeof MockFieldPath;
      FieldValue: typeof MockFieldValue;
      // tslint:disable-next-line: no-use-before-declare
      Firestore: typeof MockFirebaseFirestore;
      GeoPoint: typeof MockGeoPoint;
      Query: typeof MockQuery;
      QuerySnapshot: typeof MockQuerySnapshot;
      Timestamp: typeof MockTimestamp;
      Transaction: typeof MockTransaction;
      WriteBatch: typeof MockWriteBatch;
      setLogLevel: typeof types.setLogLevel;

      /**
 * Mocker object for reading and writing the whole firestore's state without indirect effects. This is a basic tool
 * for setting up the test setup for an unit test.
 */
      mocker: FirestoreMocker;
    };
    /**
     * Create (and initialize) a FirebaseApp.
     *
     * @param options Options to configure the services used in the App.
     * @param config The optional config for your firebase app
     */
    initializeApp(options: FirebaseOptions, config?: FirebaseAppConfig): MockFirebaseApp;
    /**
     * Create (and initialize) a FirebaseApp.
     *
     * @param options Options to configure the services used in the App.
     * @param name The optional name of the app to initialize ('[DEFAULT]' if
     * omitted)
     */
    // tslint:disable-next-line: unified-signatures
    initializeApp(options: FirebaseOptions, name?: string): MockFirebaseApp;
  }

  export interface FirebaseServiceInternals {
    /**
     * Delete the service and free it's resources - called from
     * app.delete().
     */
    delete(): Promise<void>;
  }

  // Services are exposed through instances - each of which is associated with a
  // FirebaseApp.
  export interface FirebaseService {
    app: FirebaseApp;
    INTERNAL?: FirebaseServiceInternals;
  }

  export type AppHook = (event: string, app: FirebaseApp) => void;

  /**
   * All ServiceNamespaces extend from FirebaseServiceNamespace
   */
  export type FirebaseServiceNamespace<T extends FirebaseService> = (app?: FirebaseApp) => T;

  export interface MockFirebaseErrorFactory<T> {
    create(code: T, data?: { [prop: string]: any }): MockFirebaseError;
  }

  export type FirebaseErrorFactoryClass = new (
    service: string,
    serviceName: string,
    errors: { [code: string]: string }
  ) => any;

  export interface MockFirebaseAuthTokenData {
    accessToken: string;
  }

  export interface MockFirebaseAppInternals {
    getToken(refreshToken?: boolean): Promise<MockFirebaseAuthTokenData | null>;
    getUid(): string | null;
    addAuthTokenListener(fn: (token: string | null) => void): void;
    removeAuthTokenListener(fn: (token: string | null) => void): void;
  }

  // tslint:disable-next-line: class-name
  export interface _MockFirebaseApp extends MockFirebaseApp {
    INTERNAL: MockFirebaseAppInternals;
  }
  // tslint:disable-next-line: class-name
  export interface _MockFirebaseNamespace extends MockFirebaseNamespace {
    INTERNAL: {
      /**
       * Service factories for each registered service.
       */
      factories: { [name: string]: FirebaseServiceFactory };

      /**
       * Use to construct all thrown FirebaseError's.
       */
      ErrorFactory: FirebaseErrorFactoryClass;
      /**
       * Internal API to register a Firebase Service into the firebase namespace.
       *
       * Each service will create a child namespace (firebase.<name>) which acts as
       * both a namespace for service specific properties, and also as a service
       * accessor function (firebase.<name>() or firebase.<name>(app)).
       *
       * @param name The Firebase Service being registered.
       * @param createService Factory function to create a service instance.
       * @param serviceProperties Properties to copy to the service's namespace.
       * @param appHook All appHooks called before initializeApp returns to caller.
       * @param allowMultipleInstances Whether the registered service supports
       *   multiple instances per app. If not specified, the default is false.
       */
      registerService(
        name: string,
        createService: FirebaseServiceFactory,
        serviceProperties?: { [prop: string]: any },
        appHook?: AppHook,
        // tslint:disable-next-line: bool-param-default
        allowMultipleInstances?: boolean
      ): FirebaseServiceNamespace<FirebaseService>;

      /**
       * Just used for testing to start from a fresh namespace.
       */
      createFirebaseNamespace(): FirebaseNamespace;

      /**
       * Internal API to install properties on the top-level firebase namespace.
       * @prop props The top level properties of this object are copied to the
       *   namespace.
       */
      extendNamespace(props: { [prop: string]: any }): void;

      /**
       * Create a Subscribe function.  A proxy Observer is created so that
       * events can be sent to single Observer to be fanned out automatically.
       */
      createSubscribe<T>(
        executor: (observer: Observer<T>) => void,
        onNoObservers?: (observer: Observer<T>) => void
      ): Subscribe<T>;

      /**
       * Utility exposed for internal testing.
       */
      deepExtend(target: any, source: any): any;

      /**
       * Internal API to remove an app from the list of registered apps.
       */
      removeApp(name: string): void;

      /*
       * Convert service name to factory name to use.
       */
      useAsService(app: FirebaseApp, serviceName: string): string | null;
    };
  }

  /**
   * All ServiceNamespaces extend from FirebaseServiceNamespace
   */
  export type MockFirebaseServiceNamespace<T extends MockFirebaseService> = (app?: MockFirebaseApp) => T;

  export interface MockFirebaseServiceInternals {
    /**
     * Delete the service and free it's resources - called from
     * app.delete().
     */
    delete(): Promise<void>;
  }

  // Services are exposed through instances - each of which is associated with a
  // FirebaseApp.
  export interface MockFirebaseService {
    app: MockFirebaseApp;
    INTERNAL?: MockFirebaseServiceInternals;
  }

  export type MockAppHook = (event: string, app: MockFirebaseApp) => void;

  /**
   * Firebase Services create instances given a Firebase App instance and can
   * optionally add properties and methods to each FirebaseApp via the extendApp()
   * function.
   */
  export type FirebaseServiceFactory = (
    app: MockFirebaseApp,
    extendApp?: (props: { [prop: string]: any }) => void,
    instanceString?: string
  ) => MockFirebaseService;

  /**
   * Firebase Services create instances given a Firebase App instance and can
   * optionally add properties and methods to each FirebaseApp via the extendApp()
   * function.
   */
  export interface MockFirebaseServiceFactory extends FirebaseServiceFactory {
    (
      app: MockFirebaseApp,
      extendApp?: (props: { [prop: string]: any }) => void,
      instanceString?: string
    ): MockFirebaseService;
  }
}

// TODO change this to create a separate implementations for different target environments
const firebase = createFirebaseNamespace();

export function mockFirebase(): MockFirebaseNamespace {
  // (app.firestore as any) = (appName: string = DEFAULT_ENTRY_NAME) => {
  //   const instance: MockFirebaseApp | undefined = firebase.apps.find(a => a.name === appName) ;
  //   if (!instance) {
  //     throw new Error('No instance initialized for app name: ' + appName);
  //   }
  //   return instance.firestore();
  // };
  // (app.firestore as any).FieldPath = firestore.MockFieldPath;
  // (app.firestore as any).FieldValue = firestore.MockFieldValue;
  // (app.firestore as any).Blob = firestore.MockBlob;
  // (app.firestore as any).Timestamp = firestore.MockTimestamp;
  // (app.firestore as any).GeoPoint = firestore.MockGeoPoint;
  return firebase;
}

export function mockFirebaseAdmin(): MockFirebaseNamespace {
  const adminApp = { ...firebase };

  (adminApp.firestore as any) = (appName: string = DEFAULT_ENTRY_NAME) => {
    const instance: MockFirebaseApp | undefined = firebase.apps.find(a => a.name === appName);
    if (!instance) {
      throw new Error('No instance initialized for app name: ' + appName);
    }
    return instance.firestore();
  };
  (adminApp.firestore as any).FieldPath = firestore.MockFieldPath;
  (adminApp.firestore as any).FieldValue = firestore.MockFieldValue;
  (adminApp.firestore as any).Blob = firestore.MockBlob;
  (adminApp.firestore as any).Timestamp = firestore.MockTimestamp;
  (adminApp.firestore as any).GeoPoint = firestore.MockGeoPoint;
  return adminApp;
}

export function exposeMockFirebaseAdminApp(app: any): MockFirebaseApp {
  return app as MockFirebaseApp;
}

export function exposeMockFirebaseApp(app: any): MockFirebaseApp {
  return app as MockFirebaseApp;
}

export * from './app';
export * from './auth';
export * from './firestore';
export * from './utils';

export default mockFirebase;
