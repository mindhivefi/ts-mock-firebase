import { FieldPath } from '@firebase/firestore-types';
import { NotImplementedYet } from './utils';

/**
 * A FieldPath refers to a field in a document. The path may consist of a
 * single field name (referring to a top-level field in the document), or a
 * list of field names (referring to a nested field in the document).
 */
export default class MockFieldPath implements FieldPath {

  public get path(): string {
    return this._path;
  }

  public get fieldNames(): string[] {
    return this._fieldNames;
  }
  /**
   * Returns a special sentinel FieldPath to refer to the ID of a document.
   * It can be used in queries to sort or filter by the document ID.
   */
  public static documentId = (): FieldPath => {
    throw new NotImplementedYet('MockFieldPath.documentId()');
  }
  private _path: string;

  private _fieldNames: string[];
  // private parts[]: any[];

  /**
   * Creates a FieldPath from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames A list of field names.
   */
  constructor(...fieldNames: string[]) {
    // TODO validation
    this._fieldNames = fieldNames;
    this._path = fieldNames.reduce((path = '', value, index) =>
      path ? `${path}.${value}` : value
    );
  }

  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other The `FieldPath` to compare against.
   * @return true if this `FieldPath` is equal to the provided one.
   */
  public isEqual = (other: FieldPath): boolean => {
    return (other as MockFieldPath).path === this.path;
  }
}
