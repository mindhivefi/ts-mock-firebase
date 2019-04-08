import { MockFirebaseFirestore } from '@firebase/app-types';
import {
  DocumentChange,
  DocumentChangeType,
  DocumentData,
  FieldPath,
  SetOptions,
  Transaction,
  UpdateData,
} from '@firebase/firestore-types';
import { deepCopy } from '@firebase/util';

import { MockCollectionReference } from './MockCollectionReference';
import MockDocumentReference from './MockDocumentReference';
import MockDocumentSnapshot from './MockDocumentSnapshot';
import { MockFieldPath } from './MockFieldPath';
import { MockFieldValue, processFieldValue } from './MockFieldValue';
import MockQueryDocumentSnapshot from './MockQueryDocumentSnapshot';
import { MockFirebaseValidationError, parseFieldValuePairsFromArgs } from './utils';
import { NotImplementedYet } from './utils/NotImplementedYet';

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
  public get = async (documentRef: MockDocumentReference): Promise<MockDocumentSnapshot> => {
    if (this.modified) {
      throw new MockFirebaseValidationError('Read operations can only be done before write operations.');
    }
    return new MockDocumentSnapshot(documentRef, documentRef.data ? { ...documentRef.data } : undefined); // TODO deep copy
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
  public set = (documentRef: MockDocumentReference, data: DocumentData, options?: SetOptions): Transaction => {
    this.modified = true;
    const path = documentRef.path;

    let docData = this.transactionData[path] || (documentRef.data && { ...documentRef.data }); // TODO need to do locking for transaction
    const changeType: DocumentChangeType = docData ? 'modified' : 'added';

    if (options && options.merge) {
      docData = { ...docData, ...data };
      this.transactionData[path] = documentRef.updateInTransaction(docData, data);
    } else {
      docData = { ...data };
      this.transactionData[path] = documentRef.setInTransaction(docData, data, options);
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
  public update = (
    documentRef: MockDocumentReference,
    dataOrField: UpdateData | string | FieldPath,
    ...moreFieldsAndValues: any[]
  ): Transaction => {
    this.modified = true;

    const path = documentRef.path;
    const data = this.transactionData[path] || deepCopy(documentRef.data);
    const newData = deepCopy(data);

    const fieldType = typeof dataOrField;

    if (fieldType === 'string' || dataOrField instanceof MockFieldPath) {
      // TODO remove repetative code
      const args = parseFieldValuePairsFromArgs([dataOrField], [moreFieldsAndValues]);

      this.updateFieldsFromArgs(args, data, newData);
      this.transactionData[path] = newData;
      this.transactionOperation[path] = 'modified';
      return this;
    }
    if (typeof dataOrField === 'object') {
      this.transactionData[path] = documentRef.updateInTransaction(data, dataOrField, moreFieldsAndValues);
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
  public delete = (documentRef: MockDocumentReference): Transaction => {
    this.modified = true;

    const path = documentRef.path;
    this.transactionData[path] = undefined;
    this.transactionOperation[path] = 'removed';
    return this;
  }

  public commit = async (): Promise<void> => {
    const collectionChanges: {
      [collectionId: string]: MockDocumentChange[];
    } = {};
    try {
      for (const path in this.transactionOperation) {
        if (this.transactionOperation.hasOwnProperty(path)) {
          const operation = this.transactionOperation[path];
          const doc = this.firestore.doc(path) as MockDocumentReference;

          const documentChange = await doc.commitChange(operation, this.transactionData[path]);
          const collectionPath = path.substr(0, path.lastIndexOf('/'));
          const changes: MockDocumentChange[] = collectionChanges[collectionPath] || [];
          changes.push(documentChange as any); // TODO typing
          collectionChanges[collectionPath] = changes;
        }
      }
      // iterate snapshot callbacks collections and documents
      for (const collectionId in collectionChanges) {
        if (collectionChanges.hasOwnProperty(collectionId)) {
          const documentChanges = collectionChanges[collectionId];
          for (const documentId in documentChanges) {
            if (documentChanges.hasOwnProperty(documentId)) {
              const document = documentChanges[documentId];
              document.doc.ref.fireDocumentChangeEvent(document.type, documentChanges[documentId].oldIndex, false);
            }
          }
          const collection = this.firestore.collection(collectionId) as MockCollectionReference;
          collection.fireBatchDocumentChange(documentChanges);
        }
      }
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  public rollback = (): void => {
    // tslint:disable-next-line: no-console
    console.log('rollback');
  }

  private updateFieldsFromArgs = (args: Array<string | UpdateData | FieldPath>, data: any, newData: any) => {
    for (let i = 0; i < args.length; i += 2) {
      const fieldPath = args[i];
      const fieldValue = args[i + 1];
      if (typeof fieldPath === 'string') {
        if (fieldValue instanceof MockFieldValue) {
          processFieldValue(this.firestore, data, newData, fieldPath, fieldValue);
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
          processFieldValue(this.firestore, data, parent, propPath, fieldValue);
        } else {
          parent[propPath] = fieldValue;
        }
      } else {
        throw new MockFirebaseValidationError(`Unsupported field path: typeof(${typeof fieldPath}: ${fieldPath})`);
      }
    }
  }
}
