import { FieldPath, OrderByDirection } from '@firebase/firestore-types';
import MockDocumentReference from '../MockDocumentReference';
import { MockQueryOrderRule } from '../MockQuery';
import { NotImplementedYet } from '../utils/index';

export type SortFunction = (a: any, b: any) => number;

/**
 * Generetate sorting function based on given parameters.
 *
 * @param fieldPath Name of a single field or a path object pointing to field to be used for ordering
 * @param directionStr {'asc' | 'desc' | undefined} Sorting direction. Default is `'asc'`.
 */
export function querySortFunction(
  fieldPath: string | FieldPath,
  directionStr: OrderByDirection = 'asc'
): SortFunction {
  if (typeof fieldPath === 'string') {
    return (a: MockDocumentReference, b: MockDocumentReference) => {
      const first = a.data[fieldPath];
      const second = b.data[fieldPath];

      if (first && second) {
        switch (typeof first) {
          case 'string':
            return directionStr === 'asc'
              ? first.localeCompare(second)
              : second.localeCompare(first);
          case 'number':
            return directionStr === 'asc' ? first - second : second - first;
          default:
            throw new NotImplementedYet(
              `Query sorting for data type: ${typeof first}`
            );
        }
      }
      return -1;
    };
  }
  throw new NotImplementedYet(
    `querySortFunction support for field path listing`
  );
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
        if (typeof fieldPath === 'string') {
          const first = A[fieldPath]; // TODO fieldPaths
          const second = B[fieldPath]; // TODO fieldPaths
          if (first && second) {
            switch (typeof first) {
              case 'string': {
                const value =
                  rule.directionStr === 'asc'
                    ? first.localeCompare(second)
                    : second.localeCompare(first);
                if (value !== 0) {
                  return value;
                }
                continue;
              }
              case 'number': {
                const value =
                  rule.directionStr === 'asc' ? first - second : second - first;
                if (value !== 0) {
                  return value;
                }
                continue;
              }
              default:
                continue;
            }
          }
        }
      }
    }
    return -1;
  });
  return docs;
}
