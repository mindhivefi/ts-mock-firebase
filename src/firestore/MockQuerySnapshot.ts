import {
  DocumentChange,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SnapshotListenOptions,
  SnapshotMetadata,
  DocumentData,
} from '@firebase/firestore-types';

/**
 * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects
 * representing the results of a query. The documents can be accessed as an
 * array via the `docs` property or enumerated using the `forEach` method. The
 * number of documents can be determined via the `empty` and `size`
 * properties.
 */
export default class MockQuerySnapshot<T = DocumentData> implements QuerySnapshot<DocumentData> {

  /** 
   * An array of all the documents in the QuerySnapshot. 
   */
  public get docs(): QueryDocumentSnapshot<T>[] {
    return this._docs.slice() as QueryDocumentSnapshot<T>[];
  }

  /** The number of documents in the QuerySnapshot. */
  public get size(): number {
    return this._docs.length;
  }

  /** True if there are no documents in the QuerySnapshot. */
  public get empty(): boolean {
    return this._docs.length === 0;
  }

  /**
   * The query on which you called `get` or `onSnapshot` in order to get this
   * `QuerySnapshot`.
   */
  // query: Query;
  /**
   * Metadata about this snapshot, concerning its source and if it has local
   * modifications.
   */
  public metadata: SnapshotMetadata = {
    hasPendingWrites: false,
    fromCache: false,
    isEqual: (other: SnapshotMetadata) => {
      return other.hasPendingWrites === false && other.fromCache === false;
    },
  };
  public constructor(
    public query: Query,
    private _docs: QueryDocumentSnapshot[],
    private _docChanges: DocumentChange[]
  ) { }

  /**
   * Returns an array of the documents changes since the last snapshot. If this
   * is the first snapshot, all documents will be in the list as added changes.
   *
   * @param options `SnapshotListenOptions` that control whether metadata-only
   * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
   * snapshot events.
   */
  public docChanges = (options?: SnapshotListenOptions): DocumentChange<T>[] => {
    return this._docChanges as DocumentChange<T>[];
  }

  /**
   * Enumerates all of the documents in the QuerySnapshot.
   *
   * @param callback A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg The `this` binding for the callback.
   */
  public forEach = (callback: (result: QueryDocumentSnapshot<T>) => void, thisArg?: any): void => {
    // Todo this binding
    for (const documentSnapshot of this._docs) {
      callback(documentSnapshot as QueryDocumentSnapshot<T>);
    }
  }

  /**
   * Returns true if this `QuerySnapshot` is equal to the provided one.
   *
   * @param other The `QuerySnapshot` to compare against.
   * @return true if this `QuerySnapshot` is equal to the provided one.
   */
  public isEqual = (other: QuerySnapshot): boolean => {
    return this === other;
  }
}
