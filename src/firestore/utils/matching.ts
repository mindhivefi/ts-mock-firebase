import { FieldPath, WhereFilterOp } from '@firebase/firestore-types';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
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
