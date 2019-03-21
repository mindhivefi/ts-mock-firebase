import {
  DocumentData,
  DocumentSnapshot,
  FieldPath,
  SnapshotMetadata,
  SnapshotOptions,
} from '@firebase/firestore-types';

import MockDocumentReference from './MockDocumentReference';
import { getFieldValueFromData } from './utils';

/**
 * A `DocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `DocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists` property to
 * explicitly verify a document's existence.
 */
export default class MockDocumentSnapshot implements DocumentSnapshot {
  /**
   *
   * @param ref A `DocumentReference` to the document location.
   * @param id The ID of the document for which this `DocumentSnapshot` contains data.
   */
  public constructor(public ref: MockDocumentReference, public _data: any | undefined) {}

  /** True if the document exists. */
  public get exists(): boolean {
    return this._data !== undefined;
  }

  public get id(): string {
    return this.ref.id;
  }
  /**
   * Metadata about this snapshot, concerning its source and if it has local
   * modifications.
   */
  public get metadata(): SnapshotMetadata {
    return {
      hasPendingWrites: false,
      fromCache: false,
      isEqual: (other: SnapshotMetadata): boolean => {
        return other.hasPendingWrites === false && other.fromCache === false;
      },
    };
  }

  /**
   * Retrieves all fields in the document as an Object. Returns 'undefined' if
   * the document doesn't exist.
   *
   * By default, `FieldValue.serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options An options object to configure how data is retrieved from
   * the snapshot (e.g. the desired behavior for server timestamps that have
   * not yet been set to their final value).
   * @return An Object containing all fields in the document or 'undefined' if
   * the document doesn't exist.
   */
  public data = (options?: SnapshotOptions): DocumentData | undefined => {
    return this._data;
  }

  /**
   * Retrieves the field specified by `fieldPath`. Returns 'undefined' if the
   * document or field doesn't exist.
   *
   * By default, a `FieldValue.serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
   * @param options An options object to configure how the field is retrieved
   * from the snapshot (e.g. the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @return The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  public get = (fieldPath: string | FieldPath, options?: SnapshotOptions): any => {
    return getFieldValueFromData(this._data, fieldPath);
  }

  /**
   * Returns true if this `DocumentSnapshot` is equal to the provided one.
   *
   * @param other The `DocumentSnapshot` to compare against.
   * @return true if this `DocumentSnapshot` is equal to the provided one.
   */
  public isEqual = (other: DocumentSnapshot): boolean => {
    return this === other;
  }
}
