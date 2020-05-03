import { DocumentData, FieldValue } from '@firebase/firestore-types';

import { MockFirebaseFirestore } from '@firebase/app-types';

import { MockTimestamp } from './MockTimestamp';
import { NotImplementedYet } from './utils/NotImplementedYet';

enum MockFieldValueType {
  ARRAY_UNION = 'array_union',
  ARRAY_REMOVE = 'array_remove',
  DELETE = 'delete',
  INCREMENT = 'increment',
  TIMESTAMP = 'timestamp',
}
/**
 * Sentinel values that can be used when writing document fields with set()
 * or update().
 */
export class MockFieldValue implements FieldValue {
  public get args(): any[] {
    return this._args;
  }

  public get type() {
    return this._type;
  }

  /**
   * Returns a sentinel used with set() or update() to include a
   * server-generated timestamp in the written data.
   */
  public static serverTimestamp(): FieldValue {
    return MockFieldValue.timestampSentinel;
  }

  /**
   * Returns a sentinel for use with update() to mark a field for deletion.
   */
  public static delete(): FieldValue {
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
  public static arrayUnion(...elements: any[]): FieldValue {
    return new MockFieldValue(MockFieldValueType.ARRAY_UNION, elements[0]);
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
  public static arrayRemove(...elements: any[]): FieldValue {
    return new MockFieldValue(MockFieldValueType.ARRAY_REMOVE, elements[0]);
  }

  /**
   * Returns a special value that can be used with set() or update() that tells
   * the server to increment the field's current value by the given value.
   *
   * If either the operand or the current field value uses floating point
   * precision, all arithmetic will follow IEEE 754 semantics. If both values
   * are integers, values outside of JavaScript's safe number range
   * (`Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`) are also subject
   * to precision loss. Furthermore, once processed by the Firestore backend,
   * all integer operations are capped between -2^63 and 2^63-1.
   *
   * If the current field value is not of type 'number', or if the field does
   * not yet exist, the transformation will set the field to the given value.
   *
   * @param n The value to increment by.
   * @return The FieldValue sentinel for use in a call to set() or update().
   */
  public static increment(n: number): MockFieldValue {
    return new MockFieldValue(MockFieldValueType.INCREMENT, n);
  }

  private static deleteSentinel = new MockFieldValue(MockFieldValueType.DELETE);
  private static timestampSentinel = new MockFieldValue(MockFieldValueType.TIMESTAMP);
  private _type: MockFieldValueType;
  private _args: any[];

  private constructor(type: MockFieldValueType, ...args: any[]) {
    this._type = type;
    this._args = args[0];
  }

  /**
   * Returns true if this `FieldValue` is equal to the provided one.
   *
   * @param other The `FieldValue` to compare against.
   * @return true if this `FieldValue` is equal to the provided one.
   */
  public isEqual(other: MockFieldValue): boolean {
    if (this._type !== other._type) {
      return false;
    }
    switch (this._type) {
      case MockFieldValueType.DELETE:
      case MockFieldValueType.TIMESTAMP:
        return true;
      case MockFieldValueType.INCREMENT: {
        return other._args[0] === this._args[0];
      }
      case MockFieldValueType.ARRAY_UNION:
      case MockFieldValueType.ARRAY_REMOVE: {
        if (other._args.length !== this._args.length) {
          return false;
        }
        for (let i = 0; i < this._args.length; i++) {
          if (other._args[i] !== this._args[i]) {
            return false;
          }
        }
        return true;
      }
      default:
        throw new NotImplementedYet(`MockFieldValue.isEqual have no support for FieldValue type of ${this._type}`);
    }
  }
}

/**
 * Preprocess FieldValues from data
 *
 * @export
 * @param {DocumentData} data
 * @returns {DocumentData}
 */
export function preprocessData<T extends DocumentData = any>(firestore: MockFirebaseFirestore, data: T): T {
  const result = { ...data };
  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      const value = result[key] as any;
      if (value && value instanceof MockFieldValue) {
        processFieldValue(firestore, data, result, key, value);
      } else {
        if (typeof value === 'object') {
          result[key] = preprocessData(firestore, value);
        }
      }
    }
  }
  return result;
}

/**
 * Process a single fieldvalue in object
 *
 * @export
 * @param {MockFirebaseFirestoreImpl} firestore
 * @param {DocumentData} sourceData
 * @param {DocumentData} targetData
 * @param {string} key
 * @param {MockFieldValue} fieldValue
 * @returns {DocumentData}
 */
// tslint:disable-next-line
export function processFieldValue(
  firestore: MockFirebaseFirestore,
  sourceData: DocumentData,
  targetData: DocumentData,
  key: string,
  fieldValue: MockFieldValue
) {
  switch (fieldValue.type) {
    case MockFieldValueType.DELETE:
      delete targetData[key];
      break;

    case MockFieldValueType.TIMESTAMP:
      const serverTime = firestore.mocker.serverTime;
      targetData[key] = serverTime
        ? typeof serverTime === 'function'
          ? serverTime()
          : serverTime
        : MockTimestamp.now();
      break;

    case MockFieldValueType.ARRAY_UNION:
      {
        const currentValue = targetData[key];

        if (Array.isArray(currentValue)) {
          const newValues = fieldValue.args;
          for (const arg of newValues) {
            if (currentValue.indexOf(arg) < 0) {
              currentValue.push(arg);
            }
          }
          targetData[key] = currentValue;
        } else {
          // if the field is not an array, all field values will be replaced with the given array values
          targetData[key] = fieldValue.args;
        }
      }
      break;

    case MockFieldValueType.ARRAY_REMOVE:
      {
        const currentValue = targetData[key];
        if (Array.isArray(currentValue)) {
          const newValues = fieldValue.args;
          for (const arg of newValues) {
            const index = currentValue.indexOf(arg);
            if (index >= 0) {
              currentValue.splice(index, 1);
            }
          }
          targetData[key] = currentValue;
        } else {
          // if the field is not an array, all field values will be replaced with an empty array
          targetData[key] = [];
        }
      }
      break;

    case MockFieldValueType.INCREMENT: {
      const currentValue = targetData[key];
      if (!currentValue || typeof currentValue !== 'number') {
        targetData[key] = fieldValue.args[0];
      } else {
        targetData[key] += fieldValue.args[0];
      }
    }
      break;

    default:
      throw new NotImplementedYet(`processFieldValue ${fieldValue.type}`);
  }
}
