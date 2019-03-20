import {
  DocumentChange,
  DocumentChangeType,
  DocumentData,
  FieldPath,
  SetOptions,
  Transaction,
  UpdateData,
} from '@firebase/firestore-types';
import { MockFirebaseFirestore } from '.';
import { MockCollectionReference } from './MockCollectionReference';
import MockDocumentReference from './MockDocumentReference';
import MockQueryDocumentSnapshot from './MockQueryDocumentSnapshot';
import { MockFirebaseValidationError } from './utils';

import MockDocumentSnapshot from './MockDocumentSnapshot';
import MockFieldPath from './MockFieldPath';
import MockFieldValue, { processFieldValue } from './MockFieldValue';
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
    [documentPath: string]: any,
  } = {};
  private transactionOperation: {
    [documentPath: string]: DocumentChangeType,
  } = {};

  /**
   * True if any of set, update and delete -methods have been called. Firestore do not allow any reading
   * of data after modifications are done. This field is used internally to indicate if these operations
   * have been done.
   *
   * @private
   * @memberof MockTransaction
   */
  private modified = false;

  public constructor(public firestore: MockFirebaseFirestore) {}

  /**
   * Reads the document referenced by the provided `DocumentReference.`
   *
   * @param documentRef A reference to the document to be read.
   * @return A DocumentSnapshot for the read data.
   */
  public get = async (
    documentRef: MockDocumentReference
  ): Promise<MockDocumentSnapshot> => {
    if (this.modified) {
      throw new MockFirebaseValidationError(
        'Read operations can only be done before write operations.'
      );
    }
    return new MockDocumentSnapshot(
      documentRef,
      documentRef.data ? { ...documentRef.data } : undefined
    ); // TODO deep copy
  }

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
    options?: SetOptions
  ): Transaction => {
    this.modified = true;
    const path = documentRef.path;

    let docData =
      this.transactionData[path] ||
      (documentRef.data && { ...documentRef.data }); // TODO need to do locking for transaction
    const changeType: DocumentChangeType = docData ? 'modified' : 'added';

    if (options && options.merge) {
      docData = { ...docData, ...data };
      this.transactionData[path] = documentRef.updateInTransaction(
        docData,
        data
      );
    } else {
      docData = { ...data };
      this.transactionData[path] = documentRef.setInTransaction(
        docData,
        data,
        options
      );
    }
    this.transactionOperation[path] = changeType;
    return this;
  }

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
    this.modified = true;

    const path = documentRef.path;
    const data = this.transactionData[path] || { ...documentRef.data }; // TODO need to do locking for transaction
    const newData = { ...data };

    const fieldType = typeof dataOrField;

    if (fieldType === 'string' || dataOrField instanceof MockFieldPath) {
      // TODO remove repetative code
      let args = [dataOrField];
      if (moreFieldsAndValues && moreFieldsAndValues.length > 0) {
        args = args.concat(moreFieldsAndValues);
      }
      if (args.length % 1 === 1) {
        throw new MockFirebaseValidationError(
          'Argument count does not mach in pairs. Update must contain key value -pairs to work'
        );
      }

      for (let i = 0; i < args.length; i += 2) {
        const fieldPath = args[i];
        const fieldValue = args[i + 1];
        if (typeof fieldPath === 'string') {
          if (fieldValue instanceof MockFieldValue) {
            processFieldValue(
              this.firestore,
              data,
              newData,
              fieldPath,
              fieldValue
            );
          } else {
            newData[fieldPath] = fieldValue;
          }
        } else if (fieldPath instanceof MockFieldPath) {
          const fieldNames = fieldPath.fieldNames;

          let parent = newData;
          for (let j = 1; j < fieldNames.length; j++) {
            parent[fieldNames[j - 1]] = parent = parent[fieldNames[j - 1]] || {};
            if (typeof parent !== 'object') {
              throw new MockFirebaseValidationError(
                `Illegal path. Can not add value under field type of ${typeof parent}`
              );
            }
          }
          const propPath = fieldNames[fieldNames.length - 1];

          if (fieldValue instanceof MockFieldValue) {
            processFieldValue(
              this.firestore,
              data,
              parent,
              propPath,
              fieldValue
            );
          } else {
            parent[propPath] = fieldValue;
          }
        } else
          throw new MockFirebaseValidationError(
            `Unsupported field path: typeof(${typeof fieldPath}: ${fieldPath})`
          );
      }
      this.transactionData[path] = newData;
      this.transactionOperation[path] = 'modified';
      return this;
    }
    if (typeof dataOrField === 'object') {
      // TODO fieldPaths...
      this.transactionData[path] = documentRef.updateInTransaction(
        data,
        dataOrField,
        moreFieldsAndValues
      );
      this.transactionOperation[path] = 'modified';
      return this;
    }
    throw new NotImplementedYet('MockTransaction.get');
  }

  /**
   * Deletes the document referred to by the provided `DocumentReference`.
   *
   * @param documentRef A reference to the document to be deleted.
   * @return This `Transaction` instance. Used for chaining method calls.
   */
  delete = (documentRef: MockDocumentReference): Transaction => {
    this.modified = true;

    const path = documentRef.path;
    this.transactionData[path] = undefined;
    this.transactionOperation[path] = 'removed';
    return this;
  }

  commit = async (): Promise<void> => {
    const collectionChanges: {
      [collectionId: string]: MockDocumentChange[],
    } = {};
    try {
      for (const path in this.transactionOperation) {
        const operation = this.transactionOperation[path];
        const doc = this.firestore.doc(path) as MockDocumentReference;

        const documentChange = await doc.commitChange(
          operation,
          this.transactionData[path]
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
            false
          );
        }
        const collection = this.firestore.collection(
          collectionId
        ) as MockCollectionReference;
        collection.fireBatchDocumentChange(documentChanges);
      }
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  rollback = (): void => {
    console.log('rollback');
  }
}
