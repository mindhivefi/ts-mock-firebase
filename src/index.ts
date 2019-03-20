import firebase from './firebaseApp';

/**
 * Through mockers, you can setup the object to state ready for testing and read the object's state directly.
 * Mocker -objects are mixed with the actual mock -objects as a pattern to change mock objects
 * state without any further consequences.
 */
export interface Mocker {
  /**
   * Return object's initial state
   */
  reset(): void;
}

export default firebase;

export * from './firebaseApp';
