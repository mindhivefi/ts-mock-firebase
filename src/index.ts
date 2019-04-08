import { MockFirebaseApp, MockFirebaseNamespace } from '@firebase/app-types';
import { createFirebaseNamespace } from './app';

// TODO change this to create a separate implementations for different target environments
const firebase = createFirebaseNamespace();

export function mockFirebase(): MockFirebaseNamespace {
  return firebase;
}

export function mockFirebaseAdmin(): MockFirebaseNamespace {
  return firebase;
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
