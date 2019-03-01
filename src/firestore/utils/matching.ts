import { FieldPath, WhereFilterOp } from '@firebase/firestore-types';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
import { MockQueryWhereRule } from 'firestore/QueryMock';
import { NotImplementedYet } from 'firestore/utils/index';
import { MockFirebaseValidationError } from './index';

export type MatchFunction = (doc: DocumentReferenceMock) => boolean;

export function createFirestoreMatchRuleFunction(
  fieldPath: string | FieldPath,
  opStr: WhereFilterOp,
  value: any,
): MatchFunction {
  if (typeof fieldPath === 'string') {
    return (doc: DocumentReferenceMock) => {
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
            throw new NotImplementedYet();
        }
      }
      return false;
    };
  }

  throw new NotImplementedYet();
}

export function filterDocumentsByRules(
  docs: DocumentReferenceMock[],
  rules?: MockQueryWhereRule[],
): DocumentReferenceMock[] {
  if (!rules) {
    return docs;
  }
  const result = docs.filter(doc => {
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
  return result;
}

function doesRuleMatch(rule: MockQueryWhereRule, doc: DocumentReferenceMock) {
  const { fieldPath, opStr, value } = rule;

  if (typeof fieldPath !== 'string') {
    throw new NotImplementedYet(); // todo fieldValue support
  }
  const field = doc.data[fieldPath];

  if (field) {
    switch (opStr) {
      case '==':
        if (field !== value) return false;
        break;
      case '<':
        if (field >= value) return false;
        break;
      case '<=':
        if (field > value) return false;
        break;
      case '>':
        if (field <= value) return false;
        break;
      case '>=':
        if (field < value) return false;
        break;
      case 'array-contains': {
        if (!Array.isArray(field)) throw new MockFirebaseValidationError(`Field ${fieldPath} is not an array.`);

        if (field.indexOf(value) < 0) return false;
        break;
      }
      default:
        throw new Error(`Unidentified where operation: ${opStr}`);
    }
  } else return false;
  return true;
}
