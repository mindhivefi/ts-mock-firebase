import { _MockFirebaseNamespace, MockFirebaseApp, MockFirebaseNamespace } from '@firebase/app-types';

import { MockFirebaseFirestoreImpl } from '../../app';
import { MockBlob } from '../MockBlob';
import { MockCollectionReference } from '../MockCollectionReference';
import MockDocumentReference from '../MockDocumentReference';
import MockDocumentSnapshot from '../MockDocumentSnapshot';
import { MockFieldPath } from '../MockFieldPath';
import { MockFieldValue } from '../MockFieldValue';
import { MockGeoPoint } from '../MockGeoPoint';
import MockQuery from '../MockQuery';
import MockQueryDocumentSnapshot from '../MockQueryDocumentSnapshot';
import MockQuerySnapshot from '../MockQuerySnapshot';
import { MockTimestamp } from '../MockTimestamp';
import MockTransaction from '../MockTransaction';
import { MockWriteBatch } from '../MockWritebatch';
import { shallowCopy } from '../utils/manipulation';

const firestoreNamespace = {
  Firestore: MockFirebaseFirestoreImpl,
  GeoPoint: MockGeoPoint,
  Timestamp: MockTimestamp,
  Blob: MockBlob,
  Transaction: MockTransaction,
  WriteBatch: MockWriteBatch,
  DocumentReference: MockDocumentReference,
  DocumentSnapshot: MockDocumentSnapshot,
  Query: MockQuery,
  QueryDocumentSnapshot: MockQueryDocumentSnapshot,
  QuerySnapshot: MockQuerySnapshot,
  CollectionReference: MockCollectionReference,
  FieldPath: MockFieldPath,
  FieldValue: MockFieldValue,
  // setLogLevel: MockFirebaseFirestore.setLogLevel, // TODO
  // CACHE_SIZE_UNLIMITED,
};

/**
 * Configures Firestore as part of the Firebase SDK by calling registerService.
 */
export function configureForFirebase(firebase: MockFirebaseNamespace): void {
  ((firebase as any) as _MockFirebaseNamespace).INTERNAL.registerService(
    'firestore',
    (app: MockFirebaseApp) => new MockFirebaseFirestoreImpl(app),
    shallowCopy(firestoreNamespace)
  );
}

/**
 * Exports the Firestore namespace into the provided `exportObject` object under
 * the key 'firestore'. This is used for wrapped binary that exposes Firestore
 * as a goog module.
 */
export function configureForStandalone(exportObject: { [key: string]: {} }): void {
  const copiedNamespace = shallowCopy(firestoreNamespace);
  // Unlike the use with Firebase, the standalone allows the use of the
  // constructor, so export it's internal class
  copiedNamespace.Firestore = MockFirebaseFirestoreImpl;
  exportObject.firestore = copiedNamespace;
}
