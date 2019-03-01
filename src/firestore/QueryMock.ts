import {
  CollectionReference,
  FieldPath,
  FirebaseFirestore,
  GetOptions,
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  WhereFilterOp,
} from '@firebase/firestore-types';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
import QueryDocumentSnapshotMock from 'firestore/QueryDocumentSnapshotMock';
import QuerySnapshotMock from 'firestore/QuerySnapshotMock';
import { NotImplementedYet } from 'firestore/utils/index';
import { filterDocumentsByRules } from './utils/matching';
import { sortDocumentsByRules } from './utils/sortings';

export interface MockQueryOrderRule {
  fieldPath: string | FieldPath;
  directionStr?: OrderByDirection;
}
export interface MockQueryWhereRule {
  fieldPath: string | FieldPath;
  opStr: WhereFilterOp;
  value: any;
}

interface MockQueryRules {
  // orderBy?: QueryOperationFunction[];
  order?: MockQueryOrderRule[];

  where?: MockQueryWhereRule[];
}
/**
 * A `Query` refers to a Query which you can read or listen to. You can also
 * construct refined `Query` objects by adding filters and ordering.
 */
export default class QueryMock implements Query {
  private rules: MockQueryRules = {};

  public constructor(public collectionRef: CollectionReference, public docRefs: DocumentReferenceMock[]) {
    this.firestore = collectionRef.firestore;
  }

  /**
   * The `Firestore` for the Firestore database (useful for performing
   * transactions, etc.).
   */
  firestore: FirebaseFirestore;

  /**
   * Creates and returns a new Query with the additional filter that documents
   * must contain the specified field and the value should satisfy the
   * relation constraint provided.
   *
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created Query.
   */
  public where = (fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): Query => {
    const where: MockQueryWhereRule[] = this.rules.where || [];
    where.push({
      fieldPath,
      opStr,
      value,
    });
    this.rules.where = where;
    return this;
  };

  /**
   * Creates and returns a new Query that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   *
   * @param fieldPath The field to sort by.
   * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
   * not specified, order will be ascending.
   * @return The created Query.
   */
  orderBy = (fieldPath: string | FieldPath, directionStr: OrderByDirection = 'asc'): Query => {
    const rules = this.rules.order || ([] as MockQueryOrderRule[]);
    rules.push({
      fieldPath,
      directionStr,
    });
    this.rules.order = rules;
    return this;
  };

  /**
   * Creates and returns a new Query that's additionally limited to only
   * return up to the specified number of documents.
   *
   * @param limit The maximum number of items to return.
   * @return The created Query.
   */
  limit = (limit: number): Query => {
    throw new NotImplementedYet();
  };

  /**
   * Creates and returns a new Query that starts at the provided document
   * (inclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query.
   *
   * @param snapshot   The snapshot of the document to start at.
   * or
   * @param fieldValues The field values to start this query at, in order

   * @return The created Query.
   */
  startAt = (...fieldValues: any[]): Query => {
    throw new NotImplementedYet();
  };

  // /**
  //  * Creates and returns a new Query that starts at the provided fields
  //  * relative to the order of the query. The order of the field values
  //  * must match the order of the order by clauses of the query.
  //  *
  //  * @param fieldValues The field values to start this query at, in order
  //  * of the query's order by.
  //  * @return The created Query.
  //  */
  // startAt(...fieldValues: any[]): Query;

  /**
   * Creates and returns a new Query that starts after the provided document
   * (exclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query.
   *
   * @param snapshot The snapshot of the document to start after.
   * @param fieldValues The field values to start this query after, in order
   * @return The created Query.
   */
  startAfter = (...fieldValues: any[]): Query => {
    throw new NotImplementedYet();
  };

  /**
   * Creates and returns a new Query that starts after the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to start this query after, in order
   * of the query's order by.
   * @return The created Query.
   */
  // startAfter(...fieldValues: any[]): Query;

  /**
   * Creates and returns a new Query that ends before the provided document
   * (exclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   *
   * @param snapshot The snapshot of the document to end before.
   * @param fieldValues The field values to end this query before, in order
   * @return The created Query.
   */
  endBefore = (...fieldValues: any[]): Query => {
    throw new NotImplementedYet();
  };

  /**
   * Creates and returns a new Query that ends before the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to end this query before, in order
   * of the query's order by.
   * @return The created Query.
   */
  // endBefore(...fieldValues: any[]): Query;

  /**
   * Creates and returns a new Query that ends at the provided document
   * (inclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   *
   * @param snapshot The snapshot of the document to end at.
   * @param fieldValues The field values to end this query at, in order
   * @return The created Query.
   */
  endAt = (...fieldValues: any[]): Query => {
    throw new NotImplementedYet();
  };

  /**
   * Creates and returns a new Query that ends at the provided fields
   * relative to the order of the query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param fieldValues The field values to end this query at, in order
   * of the query's order by.
   * @return The created Query.
   */
  // endAt(...fieldValues: any[]): Query;

  /**
   * Returns true if this `Query` is equal to the provided one.
   *
   * @param other The `Query` to compare against.
   * @return true if this `Query` is equal to the provided one.
   */
  isEqual = (other: Query): boolean => {
    return this === other;
  };

  /**
   * Executes the query and returns the results as a QuerySnapshot.
   *
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise that will be resolved with the results of the Query.
   */
  public get = (options?: GetOptions): Promise<QuerySnapshot> => {
    let docs = [...this.docRefs];

    const rules = this.rules;

    docs = filterDocumentsByRules(docs, rules.where);
    docs = sortDocumentsByRules(docs, rules.order);

    return new Promise<QuerySnapshot>(resolve => resolve(new QuerySnapshotMock(this, this.getDocSnapshots(docs))));
  };

  /**
   * Attaches a listener for QuerySnapshot events. You may either pass
   * individual `onNext` and `onError` callbacks or pass a single observer
   * object with `next` and `error` callbacks.
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the snapshot stream is never-ending.
   *
   * @param options Options controlling the listen behavior.
   * @param onNext A callback to be called every time a new `QuerySnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @param observer A single object containing `next` and `error` callbacks.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  // onSnapshot(observer: {
  //   next?: (snapshot: QuerySnapshot) => void;
  //   error?: (error: Error) => void;
  //   complete?: () => void;
  // }): () => void;
  // onSnapshot(
  //   options: SnapshotListenOptions,
  //   observer: {
  //     next?: (snapshot: QuerySnapshot) => void;
  //     error?: (error: Error) => void;
  //     complete?: () => void;
  //   },
  // ): () => void;
  // onSnapshot(
  //   onNext: (snapshot: QuerySnapshot) => void,
  //   onError?: (error: Error) => void,
  //   onCompletion?: () => void,
  // ): () => void;
  // onSnapshot(
  //   options: SnapshotListenOptions,
  //   onNext: (snapshot: QuerySnapshot) => void,
  //   onError?: (error: Error) => void,
  //   onCompletion?: () => void,
  // ): () => void;
  onSnapshot = () => {
    throw new NotImplementedYet();
  };

  private getDocSnapshots = (docRefs: DocumentReferenceMock[] = this.docRefs): QueryDocumentSnapshot[] => {
    return docRefs.map(doc => new QueryDocumentSnapshotMock(doc) as QueryDocumentSnapshot);
  };
}
