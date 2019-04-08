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
import { createSubscribe, deepExtend, ErrorFactory, patchProperty } from '@firebase/util';

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
