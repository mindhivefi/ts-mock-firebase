import {
  DocumentChange,
  DocumentChangeType,
  DocumentData,
  FieldPath,
  SetOptions,
  Transaction,
  UpdateData,
} from '@firebase/firestore-types';
import { MockFirebaseFirestore } from 'firestore';
import { MockCollectionReference } from 'firestore/MockCollectionReference';
import MockDocumentReference from 'firestore/MockDocumentReference';
import MockQueryDocumentSnapshot from 'firestore/MockQueryDocumentSnapshot';

import MockDocumentSnapshot from './MockDocumentSnapshot';
import { NotImplementedYet } from './utils';

export interface MockDocumentChange extends DocumentChange {
  doc: MockQueryDocumentSnapshot;
}
/**
 * A reference to a transaction.
 * The `Transaction` object passed to a transaction's updateFunction provides
 * the methods to read and write data within the transaction context. See
 * `Firestore.runTransaction()`.
 */
export default class MockTransaction implements Transaction {
  private transactionData: {
    [documentPath: string]: any;
  } = {};
  private transactionOperation: {
    [documentPath: string]: DocumentChangeType;
  } = {};

  public constructor(public firestore: MockFirebaseFirestore) {}

  /**
   * Reads the document referenced by the provided `DocumentReference.`
   *
   * @param documentRef A reference to the document to be read.
   * @return A DocumentSnapshot for the read data.
   */
  public get = (
    documentRef: MockDocumentReference,
  ): Promise<MockDocumentSnapshot> => {
    const path = documentRef.path;
    return this.transactionData[path] || documentRef.data;
  };

  /**
   * Writes to the document referred to by the provided `DocumentReference`.
   * If the document does not exist yet, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into the existing document.
   *
   * @param documentRef A reference to the document to be set.
   * @param data An object of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  set = (
    documentRef: MockDocumentReference,
    data: DocumentData,
    options?: SetOptions,
  ): Transaction => {
    const path = documentRef.path;

    let docData =
      this.transactionData[path] ||
      (documentRef.data && { ...documentRef.data }); // TODO need to do locking for transaction
    const changeType: DocumentChangeType = docData ? 'modified' : 'added';

    if (options && options.merge) {
      docData = { ...docData, ...data };
      this.transactionData[path] = documentRef.updateInTransaction(
        this,
        docData,
        data,
      );
    } else {
      docData = { ...data };
      this.transactionData[path] = documentRef.setInTransaction(
        this,
        docData,
        data,
        options,
      );
    }
    this.transactionOperation[path] = changeType;
    return this;
  };

  /**
   * Updates fields in the document referred to by the provided
   * `DocumentReference`. The update will fail if applied to a document that
   * does not exist.
   *
   * @param documentRef A reference to the document to be updated.
   * @param data An object containing the fields and values with which to
   * @param field The first field to update.
   * @param value The first value.
   * @param moreFieldsAndValues Additional key/value pairs.
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  update = (
    documentRef: MockDocumentReference,
    dataOrField?: UpdateData | string | FieldPath,
    ...moreFieldsAndValues: any[]
  ): Transaction => {
    if (typeof dataOrField === 'object') {
      // TODO fieldPaths...
      const path = documentRef.path;

      const data = this.transactionData[path] || { ...documentRef.data }; // TODO need to do locking for transaction
      this.transactionData[path] = documentRef.updateInTransaction(
        this,
        data,
        dataOrField,
        moreFieldsAndValues,
      );
      this.transactionOperation[path] = 'modified';
      return this;
    }
    throw new NotImplementedYet('MockTransaction.get');
  };

  // /**
  //  * Updates fields in the document referred to by the provided
  //  * `DocumentReference`. The update will fail if applied to a document that
  //  * does not exist.
  //  *
  //  * Nested fields can be updated by providing dot-separated field path
  //  * strings or by providing FieldPath objects.
  //  *
  //  * @param documentRef A reference to the document to be updated.
  //  * @param field The first field to update.
  //  * @param value The first value.
  //  * @param moreFieldsAndValues Additional key/value pairs.
  //  * @return A Promise resolved once the data has been successfully written
  //  * to the backend (Note that it won't resolve while you're offline).
  //  */
  // update(
  //   documentRef: DocumentReference,
  //   field: string | FieldPath,
  //   value: any,
  //   ...moreFieldsAndValues: any[]
  // ): Transaction;

  /**
   * Deletes the document referred to by the provided `DocumentReference`.
   *
   * @param documentRef A reference to the document to be deleted.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  delete = (documentRef: MockDocumentReference): Transaction => {
    const path = documentRef.path;
    this.transactionData[path] = undefined;
    this.transactionOperation[path] = 'removed';
    return this;
  };

  commit = async (): Promise<void> => {
    const collectionChanges: {
      [collectionId: string]: MockDocumentChange[];
    } = {};
    try {
      for (const path in this.transactionOperation) {
        const operation = this.transactionOperation[path];
        const doc = this.firestore.doc(path) as MockDocumentReference;

        const documentChange = await doc.commitChange(
          operation,
          this.transactionData[path],
        );
        const collectionPath = path.substr(0, path.lastIndexOf('/'));
        const changes: MockDocumentChange[] =
          collectionChanges[collectionPath] || [];
        changes.push(documentChange as any); // TODO typing
        collectionChanges[collectionPath] = changes;
      }
      // iterate snapshot callbacks collections and documents
      for (const collectionId in collectionChanges) {
        const documentChanges = collectionChanges[collectionId];
        for (const documentId in documentChanges) {
          const document = documentChanges[documentId];
          document.doc.ref.fireDocumentChangeEvent(
            document.type,
            documentChanges[documentId].oldIndex,
            false,
          );
        }
        const collection = this.firestore.collection(
          collectionId,
        ) as MockCollectionReference;
        collection.fireBatchDocumentChange(documentChanges);
      }
    } catch (error) {
      this.rollback();
      throw error;
    }
  };

  rollback = (): void => {};
}
