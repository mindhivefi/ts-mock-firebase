import { MockDocument, MockCollection, MockCollections, MockDocuments } from './../index';
import { MockDocumentSnapshotCallback } from './../MockDocumentReference';
import { DocumentData, } from '@firebase/firestore-types';


/**
 * Helper function to define a document with typings in mock database
 * @param content Mock document's data
 */
export const _d = <T = DocumentData>(content: {
  data?: T,
  collections?: MockCollections<T>,
  listerners?: MockDocumentSnapshotCallback[]
}
): MockDocument<T> => {
  return {
    ...content,
  }
}

/**
 * Helper function to define a collection with typings in mock database
 * @param content Mock collections's data
 */
export const _c = <T = DocumentData>(content: {
  docs?: MockDocuments<T>;
  listeners?: any[];
}
): MockCollection<T> => {
  return {
    ...content,
  } as MockCollection<T>
}

export const _o = <T = DocumentData>(data: T) => {
  return data as T;
}

interface StringMap<T> {
  [key: string]: T;
}
export const _m = <T = DocumentData>(data: StringMap<T>): StringMap<T> => {
  return data as StringMap<T>;
}