import {
  FirebaseAppConfig,
  FirebaseOptions,
  MockAppHook,
  MockFirebaseApp,
  MockFirebaseNamespace,
  MockFirebaseService,
  MockFirebaseServiceFactory,
  MockFirebaseServiceNamespace,
} from '@firebase/app-types';
import { FirebaseErrorFactory } from '@firebase/app-types/private';
import * as types from '@firebase/firestore-types';
import { createSubscribe, deepExtend, ErrorFactory, Observer, patchProperty, Subscribe } from '@firebase/util';
import { MockFieldPath, MockFieldValue, MockFirebaseFirestoreImpl, MockTimestamp } from '../firestore';
import { MockBlob } from '../firestore/MockBlob';
import { MockCollectionReference } from '../firestore/MockCollectionReference';
import MockDocumentReference from '../firestore/MockDocumentReference';
import MockDocumentSnapshot from '../firestore/MockDocumentSnapshot';
import { MockGeoPoint } from '../firestore/MockGeoPoint';
import MockQuery from '../firestore/MockQuery';
import MockQuerySnapshot from '../firestore/MockQuerySnapshot';
import MockTransaction from '../firestore/MockTransaction';
import { MockWriteBatch } from '../firestore/MockWritebatch';
import { MockFirebaseError } from '../utils';

import { FirestoreMocker } from '../firestore/FirestoreMocker';
import { MockFirebaseAppImpl } from './app';

export const DEFAULT_ENTRY_NAME = '[DEFAULT]';

const contains = (obj: object, key: string) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * Through mockers, you can setup the object to state ready for testing and read the object's state directly.
 * Mocker -objects are mixed with the actual mock -objects as a pattern to change mock objects
 * state without any further consequences.
 */
export interface Mocker {
  /**
   * Return object's initial state. You should call this before each firestore test case, to initialize the database state
   */
  reset(): void;
}

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
  export class MockFirebaseFirestore {
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
    public collection(collectionPath: string): MockCollectionReference;

    /**
     * Gets a `DocumentReference` instance that refers to the document at the
     * specified path.
     *
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    public doc(documentPath: string): MockDocumentReference;

    // TODO(b/116617988): Uncomment method and change jsdoc comment to "/**"
    // once backend support is ready.
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
    // collectionGroup(collectionId: string): Query;

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
      Firestore: typeof MockFirebaseFirestoreImpl;
      GeoPoint: typeof MockGeoPoint;
      Query: typeof MockQuery;
      QuerySnapshot: typeof MockQuerySnapshot;
      Timestamp: typeof MockTimestamp;
      Transaction: typeof MockTransaction;
      WriteBatch: typeof MockWriteBatch;
      setLogLevel: typeof types.setLogLevel;
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
  ) => FirebaseErrorFactory<any>;

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
/**
 * Return a firebase namespace object.
 *
 * In production, this will be called exactly once and the result
 * assigned to the 'firebase' global.  It may be called multiple times
 * in unit tests.
 */
// tslint:disable-next-line
export function createFirebaseNamespace(): MockFirebaseNamespace {
  const apps_: { [name: string]: MockFirebaseApp } = {};
  const factories: { [service: string]: MockFirebaseServiceFactory } = {};
  const appHooks: { [service: string]: MockAppHook } = {};

  // A namespace is a plain JavaScript Object.
  const namespace = {
    // Hack to prevent Babel from modifying the object returned
    // as the firebase namespace.
    __esModule: true,
    initializeApp,
    app: app as any,
    apps: null as any,
    Promise,
    SDK_VERSION: 'ts-mock-firebase',
    INTERNAL: {
      registerService,
      createFirebaseNamespace,
      extendNamespace,
      createSubscribe,
      ErrorFactory,
      removeApp,
      factories,
      useAsService,
      Promise,
      deepExtend,
    },
  };

  // Inject a circular default export to allow Babel users who were previously
  // using:
  //
  //   import firebase from 'firebase';
  //   which becomes: var firebase = require('firebase').default;
  //
  // instead of
  //
  //   import * as firebase from 'firebase';
  //   which becomes: var firebase = require('firebase');
  patchProperty(namespace, 'default', namespace);

  // firebase.apps is a read-only getter.
  Object.defineProperty(namespace, 'apps', {
    get: getApps,
  });

  /**
   * Called by App.delete() - but before any services associated with the App
   * are deleted.
   */
  function removeApp(name: string): void {
    const appToBeRemoved = apps_[name];
    callAppHooks(appToBeRemoved, 'delete');
    delete apps_[name];
  }

  /**
   * Get the App object for a given name (or DEFAULT).
   */
  function app(name?: string): MockFirebaseApp {
    const nameOfApp = name || DEFAULT_ENTRY_NAME;
    if (!contains(apps_, nameOfApp)) {
      error('no-app', { name: nameOfApp });
    }
    return apps_[nameOfApp];
  }

  patchProperty(app, 'App', MockFirebaseAppImpl);

  /**
   * Create a new App instance (name must be unique).
   */
  function initializeApp(options: FirebaseOptions, configOrName?: FirebaseAppConfig | string): MockFirebaseApp {
    const config: FirebaseAppConfig = typeof configOrName === 'object' ? configOrName : { name: configOrName };

    if (config.name === undefined) {
      config.name = DEFAULT_ENTRY_NAME;
    }

    const { name } = config;

    if (typeof name !== 'string' || !name) {
      // tslint:disable-next-line
      error('bad-app-name', { name: name + '' });
    }

    if (contains(apps_, name)) {
      // tslint:disable-next-line
      error('duplicate-app', { name: name });
    }

    const newApp = new MockFirebaseAppImpl(options, config, namespace as any); // TODO resolve this

    apps_[name] = newApp;
    // callAppHooks(newApp, 'create');
    return newApp;
  }

  /*
   * Return an array of all the non-deleted FirebaseApps.
   */
  function getApps(): MockFirebaseApp[] {
    // Make a copy so caller cannot mutate the apps list.
    return Object.keys(apps_).map(name => apps_[name]);
  }

  /*
   * Register a Firebase Service.
   *
   * firebase.INTERNAL.registerService()
   *
   * TODO: Implement serviceProperties.
   */
  function registerService(
    name: string,
    createService: MockFirebaseServiceFactory,
    serviceProperties?: { [prop: string]: any },
    appHook?: MockAppHook,
    // tslint:disable-next-line
    allowMultipleInstances?: boolean,
  ): MockFirebaseServiceNamespace<MockFirebaseService> {
    // Cannot re-register a service that already exists
    if (factories[name]) {
      // tslint:disable-next-line
      error('duplicate-service', { name: name });
    }

    // Capture the service factory for later service instantiation
    factories[name] = createService;

    // Capture the appHook, if passed
    if (appHook) {
      appHooks[name] = appHook;
      // Run the **new** app hook on all existing apps
      getApps().forEach(anApp => {
        appHook('create', anApp);
      });
    }

    // The Service namespace is an accessor function ...
    const serviceNamespace = (appArg: MockFirebaseApp = app()) => {
      if (typeof (appArg as any)[name] !== 'function') {
        // Invalid argument.
        // This happens in the following case: firebase.storage('gs:/')
        // tslint:disable-next-line
        error('invalid-app-argument', { name: name });
      }

      // Forward service instance lookup to the FirebaseApp.
      return (appArg as any)[name]();
    };

    // ... and a container for service-level properties.
    if (serviceProperties !== undefined) {
      deepExtend(serviceNamespace, serviceProperties);
    }

    // tslint:disable-next-line
    // Monkey-patch the serviceNamespace onto the firebase namespace
    (namespace as any)[name] = serviceNamespace;
    // Patch the FirebaseAppImpl prototype
    (MockFirebaseAppImpl.prototype as any)[name] = (...args: any[]) => {
      // tslint:disable-next-line
      const self: any = this as MockFirebaseApp;
      const serviceFxn = self._getService.bind(self, name);
      return serviceFxn.apply(self, allowMultipleInstances ? args : []);
    };

    return serviceNamespace as any;
  }

  /**
   * Patch the top-level firebase namespace with additional properties.
   *
   * firebase.INTERNAL.extendNamespace()
   */
  function extendNamespace(props: { [prop: string]: any }): void {
    deepExtend(namespace, props);
  }

  function callAppHooks(hookedApp: MockFirebaseApp, eventName: string) {
    Object.keys(factories).forEach(serviceName => {
      // Ignore virtual services
      const factoryName = useAsService(hookedApp, serviceName);
      if (factoryName === null) {
        return;
      }

      if (appHooks[factoryName]) {
        appHooks[factoryName](eventName, hookedApp);
      }
    });
  }

  // Map the requested service to a registered service name
  // (used to map auth to serverAuth service when needed).
  function useAsService(targetApp: MockFirebaseApp, name: string): string | null {
    if (name === 'serverAuth') {
      return null;
    }

    // tslint:disable-next-line
    // const useService = name
    // tslint:disable-next-line
    // const options = targetApp.options
    return name;
  }

  return namespace as any; // TODO check this out
}

type AppError =
  | 'no-app'
  | 'bad-app-name'
  | 'duplicate-app'
  | 'app-deleted'
  | 'duplicate-service'
  | 'sa-not-supported'
  | 'invalid-app-argument';

// TypeScript does not support non-string indexes!
// let errors: {[code: AppError: string} = {
const errors: { [code: string]: string } = {
  'no-app': "No Firebase App '{$name}' has been created - " + 'call Firebase App.initializeApp()',
  'bad-app-name': "Illegal App name: '{$name}",
  'duplicate-app': "Firebase App named '{$name}' already exists",
  'app-deleted': "Firebase App named '{$name}' already deleted",
  'duplicate-service': "Firebase service named '{$name}' already registered",
  'sa-not-supported':
    'Initializing the Firebase SDK with a service ' +
    'account is only allowed in a Node.js environment. On client ' +
    'devices, you should instead initialize the SDK with an api key and ' +
    'auth domain',
  'invalid-app-argument': 'firebase.{$name}() takes either no argument or a ' + 'Firebase App instance.',
};

const appErrors = new ErrorFactory<AppError>('app', 'Firebase', errors);

export function error(code: AppError, args?: { [name: string]: any }) {
  throw appErrors.create(code, args);
}

export * from './app';
export * from '../firestore';
export * from '../auth';
export * from '../utils';

// export const firebaseNamespace = createFirebaseNamespace();

// export default firebaseNamespace;
