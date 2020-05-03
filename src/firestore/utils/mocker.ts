import { DocumentMocker } from './../MockDocumentReference';
import { MockCollectionReference, CollectionMocker } from './../MockCollectionReference';
import { DocumentReference, DocumentData, CollectionReference } from '@firebase/firestore-types';
import MockDocumentReference from '../MockDocumentReference';




export const mocker = <T = DocumentData>(input: DocumentReference<T> | CollectionReference<T>): DocumentMocker<T> | CollectionMocker<T> => {

  if (input instanceof DocumentReference) {
    return (input as unknown as MockDocumentReference<T>).mocker;
  }
  if (input instanceof CollectionReference) {
    return (input as unknown as MockCollectionReference<T>).mocker;
  }
  return input;
}