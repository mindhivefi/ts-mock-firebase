import { FieldPath, OrderByDirection } from '@firebase/firestore-types';

import { getFieldValue } from '.';
import { MockTimestamp } from '../../app';
import { MockBlob } from '../MockBlob';
import MockDocumentReference from '../MockDocumentReference';
import { MockFieldPath } from '../MockFieldPath';
import { MockGeoPoint } from '../MockGeoPoint';
import { MockQueryOrderRule } from '../MockQuery';
import { NotImplementedYet } from './NotImplementedYet';

export type SortFunction = (a: any, b: any) => number;

/**
 * Data types supported by Firestore. Datatypes are defined in an order to match the sorting order
 * of different data types
 */
export enum MockFirestoreDatatype {
  UNDEFINED = 0, // not an actual data type
  Null = 1,
  Boolean = 2,
  Integer = 3,
  Float = 4,
  Numerical = 5,
  Date = 6,
  Date_Timestamp = 7,
  Text = 8,
  Byte = 9,
  Reference = 10,
  GeoPoint = 11,
  Array = 12,
  Map = 13,
}

/**
 * Generetate sorting function based on given parameters.
 *
 * @param fieldPath Name of a single field or a path object pointing to field to be used for ordering
 * @param directionStr {'asc' | 'desc' | undefined} Sorting direction. Default is `'asc'`.
 */
export function querySortFunction(fieldPath: string | FieldPath, directionStr: OrderByDirection = 'asc'): SortFunction {
  if (fieldPath === MockFieldPath.documentId) {
    return (a: MockDocumentReference, b: MockDocumentReference) => {
      // Special case for comparing document ids
      return a.id.localeCompare(b.id);
    };
  }

  return (a: MockDocumentReference, b: MockDocumentReference): number => {
    const first = getFieldValue(a, fieldPath);
    const second = getFieldValue(b, fieldPath);

    if (first === undefined || second === undefined) {
      console.warn(`Field value not found for path ${fieldPath}`);
      return 0;
    }
    const firstType = getFirestoreDataType(first);
    const secondType = getFirestoreDataType(second);
    if (firstType !== secondType) {
      return directionStr === 'asc' ? firstType - secondType : -(firstType - secondType);
    }
    // TODO optimize this to resolve a correct compare function on first call

    let result: number;

    switch (firstType) {
      case MockFirestoreDatatype.Array:
        result = compareArrays(first, second);
        break;
      case MockFirestoreDatatype.Boolean:
        result = first - second;
        break;
      case MockFirestoreDatatype.Float:
      case MockFirestoreDatatype.Integer:
      case MockFirestoreDatatype.Numerical:
        result = first - second;
        break;
      case MockFirestoreDatatype.Text:
        const leftText = cut1500(first);
        const rightText = cut1500(second);
        result = leftText.localeCompare(rightText);
        break;

      case MockFirestoreDatatype.Date:
      case MockFirestoreDatatype.Date_Timestamp: {
        const left = firstType === MockFirestoreDatatype.Date ? MockTimestamp.fromDate(first) : first;
        const right = secondType === MockFirestoreDatatype.Date ? MockTimestamp.fromDate(second) : second;
        result = compareTimestamps(left, right);
        break;
      }

      case MockFirestoreDatatype.GeoPoint:
        result = compareGeoPoints(first, second);
        break;

      case MockFirestoreDatatype.Map:
        result = compareObjects(first, second);
        break;

      case MockFirestoreDatatype.Null:
        return 0;

      case MockFirestoreDatatype.Byte:
        result = compareBlobs(first, second);
        break;

      case MockFirestoreDatatype.Reference:

      default:
        throw new NotImplementedYet(`Query sorting for data type: ${firstType}`);
    }
    return directionStr === 'asc' ? result : -result;
  };
}

export function sortDocumentsByRules(
  docs: MockDocumentReference[],
  rules?: MockQueryOrderRule[]
): MockDocumentReference[] {
  if (!rules) {
    return docs;
  }
  docs.sort((a: MockDocumentReference, b: MockDocumentReference) => {
    const A = a.data;
    const B = b.data;

    if (A && B) {
      for (const rule of rules) {
        const fieldPath = rule.fieldPath;
        const value = querySortFunction(fieldPath, rule.directionStr)(a, b);
        if (value !== 0) {
          return value;
        }
      }
    }
    return 0;
  });
  return docs;
}

function cut1500(text: string): string {
  if (text.length < 1500) {
    return text;
  }
  return text.substr(0, 1500);
}

export function getFirestoreDataType(value: any): MockFirestoreDatatype {
  if (value === undefined) {
    return MockFirestoreDatatype.UNDEFINED;
  }
  if (value === null) {
    return MockFirestoreDatatype.Null;
  }
  if (Array.isArray(value)) {
    return MockFirestoreDatatype.Array;
  }

  switch (typeof value) {
    case 'string':
      return MockFirestoreDatatype.Text;
    case 'number':
      return MockFirestoreDatatype.Numerical;
    case 'boolean':
      return MockFirestoreDatatype.Boolean;
    case 'object': {
      if (value instanceof Date) {
        return MockFirestoreDatatype.Date;
      }
      if (value instanceof MockTimestamp) {
        return MockFirestoreDatatype.Date_Timestamp;
      }
      if (value instanceof MockGeoPoint) {
        return MockFirestoreDatatype.GeoPoint;
      }
      if (value instanceof MockBlob) {
        return MockFirestoreDatatype.Byte;
      }
      return MockFirestoreDatatype.Map;
    }
    // TODO bytes, reference, string max 1500 character check
    default:
      throw new NotImplementedYet(`Query sorting for data type: ${typeof value}`);
  }
}
/**
 * Compare to objects based on Firestore's sorting rules.
 *
 * @see https://cloud.google.com/firestore/docs/concepts/data-types
 */
export function compareObjects(a: any, b: any): number {
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
    return 0;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  const min = Math.min(aKeys.length, bKeys.length);

  for (let i = 0; i < min; i++) {
    if (aKeys[i] < bKeys[i]) {
      return -1;
    }
    if (aKeys[i] > bKeys[i]) {
      return 1;
    }
  }

  const aValues = Object.values(a) as any;
  const bValues = Object.values(b) as any;
  for (let i = 0; i < min; i++) {
    if (aValues[i] < bValues[i]) {
      return -1;
    }
    if (aValues[i] > bValues[i]) {
      return 1;
    }
  }

  if (aKeys.length > bKeys.length) {
    return 1;
  } else {
    if (aKeys.length < bKeys.length) {
      return -1;
    }
  }
  return 0;
}

export function compareArrays(a: any[], b: any[]): number {
  if (!a || !b || !Array.isArray(a) || !Array.isArray(b)) {
    return 0;
  }
  const min = Math.min(a.length, b.length);

  for (let i = 0; i < min; i++) {
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }

  if (a.length > b.length) {
    return 1;
  } else {
    if (a.length < b.length) {
      return -1;
    }
  }
  return 0;
}

export function compareTimestamps(a: MockTimestamp, b: MockTimestamp): number {
  const seconds = a.seconds - b.seconds;
  if (seconds < 0) {
    return -1;
  }
  if (seconds > 0) {
    return 1;
  }
  const nanos = a.nanoseconds - b.nanoseconds;
  if (nanos < 0) {
    return -1;
  }
  if (nanos > 0) {
    return 1;
  }
  return 0;
}

export function compareGeoPoints(a: MockGeoPoint, b: MockGeoPoint): number {
  const latitude = a.latitude - b.latitude;
  if (latitude < 0) {
    return -1;
  }
  if (latitude > 0) {
    return 1;
  }
  const longitude = a.longitude - b.longitude;
  if (longitude < 0) {
    return -1;
  }
  if (longitude > 0) {
    return 1;
  }
  return 0;
}

export function compareBlobs(a: MockBlob, b: MockBlob): number {
  return a._compareTo(b);
}
