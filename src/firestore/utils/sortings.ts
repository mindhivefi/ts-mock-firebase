import { FieldPath, OrderByDirection } from '@firebase/firestore-types';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
import { NotImplementedYet } from 'firestore/utils/index';

export type SortFunction = (a: any, b: any) => number;

/**
 * Generetate sorting function based on given parameters.
 *
 * @param fieldPath Name of a single field or a path object pointing to field to be used for ordering
 * @param directionStr {'asc' | 'desc' | undefined} Sorting direction. Default is `'asc'`.
 */
export function querySortFunction(fieldPath: string | FieldPath, directionStr: OrderByDirection = 'asc'): SortFunction {
  if (typeof fieldPath === 'string') {
    return (a: DocumentReferenceMock, b: DocumentReferenceMock) => {
      const first = a.data[fieldPath];
      const second = b.data[fieldPath];

      if (first && second) {
        switch (typeof first) {
          case 'string':
            return directionStr === 'asc' ? first.localeCompare(second) : second.localeCompare(first);
          case 'number':
            return directionStr === 'asc' ? first - second : second - first;
          default:
            throw new NotImplementedYet();
        }
      }
      return -1;
    };
  }
  throw new NotImplementedYet();
}
