import { FieldPath, WhereFilterOp, DocumentData } from '@firebase/firestore-types';

import { MockFirebaseValidationError } from '.';
import MockDocumentReference from '../MockDocumentReference';
import { MockQueryWhereRule } from '../MockQuery';
import { NotImplementedYet } from '../utils/NotImplementedYet';

export type MatchFunction = (doc: MockDocumentReference) => boolean;

export function createFirestoreMatchRuleFunction(
  fieldPath: string | FieldPath,
  opStr: WhereFilterOp,
  value: any
): MatchFunction {
  if (typeof fieldPath === 'string') {
    return (doc: MockDocumentReference) => {
      if (!doc.data) {
        return false;
      }
      const field = doc.data[fieldPath];

      if (field) {
        switch (opStr) {
          case '==':
            return field === value;
          case '<':
            return field < value;
          case '<=':
            return field <= value;
          case '>':
            return field > value;
          case '>=':
            return field >= value;
          case 'array-contains': {
            if (!Array.isArray(field)) {
              throw new MockFirebaseValidationError(`Field ${fieldPath} is not an array.`);
            }
            return field.indexOf(value) >= 0;
          }
          default:
            throw new Error(`Unexpection comparization operation: ${opStr}`);
        }
      }
      return false;
    };
  }
  throw new NotImplementedYet('createFirestoreMatchRuleFunction');
}

export function filterDocumentsByRules<T = DocumentData>(
  docs: MockDocumentReference<T>[],
  rules?: MockQueryWhereRule[]
): MockDocumentReference<T>[] {
  if (!rules) {
    return docs.filter(d => d.data !== undefined);
  }
  return docs.filter(doc => {
    // Documents that do not exists, will be removed automatically from the list
    if (!doc.data) {
      return false;
    }
    for (const rule of rules) {
      if (!doesRuleMatch(rule, doc)) {
        return false;
      }
    }
    return true;
  });
}

function doesRuleMatch<T>(rule: MockQueryWhereRule, doc: MockDocumentReference<T>) {
  const { fieldPath, opStr, value } = rule;

  if (typeof fieldPath !== 'string') {
    throw new NotImplementedYet('doesRuleMatch - field value support');
  }
  let field;
  if (fieldPath.includes('.')) {
    field = doc.data;
    const paths = fieldPath.split('.');
    for (const path of paths) {
      field = (field as any)[path];
      if (!field) {
        return value === undefined;
      }
    }
  } else {
    field = (doc.data as any)[fieldPath];
  }
  if (field === undefined) {
    return false;
  }
  switch (opStr) {
    case '==':
      if (field !== value) {
        return false;
      }
      break;
    case '<':
      if (field >= value) {
        return false;
      }
      break;
    case '<=':
      if (field > value) {
        return false;
      }
      break;
    case '>':
      if (field <= value) {
        return false;
      }
      break;
    case '>=':
      if (field < value) {
        return false;
      }
      break;
    case 'array-contains': {
      if (!Array.isArray(field)) {
        throw new MockFirebaseValidationError(`Error: Field ${fieldPath} is not an array.`);
      }

      if (field.indexOf(value) < 0) {
        return false;
      }
      break;
    }
    default:
      throw new Error(`Unidentified where operation: ${opStr}`);
  }

  return true;
}
