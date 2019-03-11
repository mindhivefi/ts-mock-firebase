import { DocumentData, FieldValue } from '@firebase/firestore-types';

import { NotImplementedYet } from './utils';
import { MockFirebaseFirestore } from 'firestore';
import MockTimestamp from './MockTimestamp';

enum MockFieldValueType {
  DELETE = 'delete',
  TIMESTAMP = 'timestamp',
  ARRAY_UNION = 'array_union',
  ARRAT_REMOVE = 'array_remove',
}
/**
 * Sentinel values that can be used when writing document fields with set()
 * or update().
 */
export default class MockFieldValue implements FieldValue {
  private _type: MockFieldValueType;

  private static deleteSentinel = new MockFieldValue(MockFieldValueType.DELETE);
  private static timestampSentinel = new MockFieldValue(
    MockFieldValueType.TIMESTAMP,
  );

  private constructor(type: MockFieldValueType, ...args: any[]) {
    this._type = type;
  }

  public get type() {
    return this._type;
  }

  /**
   * Returns a sentinel used with set() or update() to include a
   * server-generated timestamp in the written data.
   */
  static serverTimestamp(): FieldValue {
    return MockFieldValue.timestampSentinel;
  }

  /**
   * Returns a sentinel for use with update() to mark a field for deletion.
   */
  static delete(): FieldValue {
    return MockFieldValue.deleteSentinel;
  }

  /**
   * Returns a special value that can be used with set() or update() that tells
   * the server to union the given elements with any array value that already
   * exists on the server. Each specified element that doesn't already exist in
   * the array will be added to the end. If the field being modified is not
   * already an array it will be overwritten with an array containing exactly
   * the specified elements.
   *
   * @param elements The elements to union into the array.
   * @return The FieldValue sentinel for use in a call to set() or update().
   */
  static arrayUnion(...elements: any[]): FieldValue {
    throw new NotImplementedYet('serverTimestamp');
  }

  /**
   * Returns a special value that can be used with set() or update() that tells
   * the server to remove the given elements from any array value that already
   * exists on the server. All instances of each element specified will be
   * removed from the array. If the field being modified is not already an
   * array it will be overwritten with an empty array.
   *
   * @param elements The elements to remove from the array.
   * @return The FieldValue sentinel for use in a call to set() or update().
   */
  static arrayRemove(...elements: any[]): FieldValue {
    throw new NotImplementedYet('serverTimestamp');
  }

  /**
   * Returns true if this `FieldValue` is equal to the provided one.
   *
   * @param other The `FieldValue` to compare against.
   * @return true if this `FieldValue` is equal to the provided one.
   */
  isEqual(other: FieldValue): boolean {
    throw new NotImplementedYet('serverTimestamp');
  }
}

/**
 * Preprocess FieldValues from data
 *
 * @export
 * @param {DocumentData} data
 * @returns {DocumentData}
 */
export function preprocessData(
  firestore: MockFirebaseFirestore,
  data: DocumentData,
): DocumentData {
  const result = { ...data };
  for (const key in result) {
    const value = result[key];
    if (value && value instanceof MockFieldValue) {
      switch (value.type) {
        case MockFieldValueType.DELETE:
          delete result[key];
          break;

        case MockFieldValueType.TIMESTAMP:
          const serverTime = firestore.mocker.serverTime;
          result[key] = serverTime
            ? typeof serverTime === 'function'
              ? serverTime()
              : serverTime
            : MockTimestamp.now();
          break;

        default:
          throw new NotImplementedYet('preprocessData');
      }
    } else {
      if (typeof value === 'object') {
        result[key] = preprocessData(firestore, value);
      }
    }
  }
  return result;
}
