import { FirestoreError, FirestoreErrorCode } from '@firebase/firestore-types';

export class MockFirestoreError extends Error implements FirestoreError {
  public name: string;
  public stack?: string;
  /**
   * Creates an instance of MockFirestoreError.
   *
   * @param {FirestoreErrorCode} code Firestore's error code
   * @param {string} message A human readable error message to be included with error
   * @memberof MockFirestoreError
   */
  constructor(public code: FirestoreErrorCode, public message: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}
