import { MockFirebaseFirestore } from '..';
import MockFieldValue, { processFieldValue } from '../MockFieldValue';

/**
 * Copy properties from source to target (recursively allows extension
 * of Objects and Arrays).  Scalar values in the target are over-written.
 * If target is undefined, an object of the appropriate type will be created
 * (and returned).
 *
 * We recursively copy all child properties of plain Objects in the source- so
 * that namespace- like dictionaries are merged.
 *
 * Note that the target can be a function, in which case the properties in
 * the source Object are copied onto it as static properties of the Function.
 */
// tslint:disable-next-line: cognitive-complexity
export function processAndDeepMerge(firestore: MockFirebaseFirestore, target: any, source: any) {
  if (!source || !(source instanceof Object)) {
    return source;
  }
  let result: any;

  switch (source.constructor) {
    // case Date:
    //   // Treat Dates like scalars; if the target date object had any child
    //   // properties - they will be lost!
    //   const dateValue = source as Date;
    //   return new Date(dateValue.getTime());
    case Object:
      result = target !== undefined ? { ...target } : {};
      break;
    case Array:
      // Always copy the array source and overwrite the target.
      result = target !== undefined ? target.slice() : [];
      break;
    default:
      // Not a plain Object - treat it as a scalar.
      return source;
  }

  for (const prop in source) {
    if (source.hasOwnProperty(prop)) {
      const sourceValue = source[prop];
      const targetValue = target ? target[prop] : undefined;

      if (!sourceValue) {
        result[prop] = targetValue;
        continue;
      }
      switch (sourceValue.constructor) {
        case Date:
          // Treat Dates like scalars; if the target date object had any child
          // properties - they will be lost!
          const dateValue = source as Date;
          result[prop] = new Date(dateValue.getTime());
          break;

        case Object:
          result[prop] = processAndDeepMerge(firestore, targetValue, sourceValue);
          break;
        case Array:
          // Always copy the array source and overwrite the target.
          result[prop] = processAndDeepMerge(firestore, targetValue ? targetValue.slice() : [], sourceValue);
          break;
        case MockFieldValue:
          processFieldValue(firestore, source, result, prop, sourceValue);
          break;

        default:
          // Not a plain Object - treat it as a scalar.
          result[prop] = sourceValue;
      }
    }
  }
  return result;
}
