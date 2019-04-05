import {
  DocumentChangeType,
  DocumentData,
  DocumentReference,
  FieldPath,
  SetOptions,
  UpdateData,
  WriteBatch,
} from '@firebase/firestore-types';
import { MockFirebaseFirestore } from '.';

import { deepCopy } from '@firebase/util';
import { MockCollectionReference } from './MockCollectionReference';
import MockDocumentReference from './MockDocumentReference';
import MockFieldPath from './MockFieldPath';
import { MockDocumentChange } from './MockTransaction';
import { parseFieldValuePairsFromArgs, setFieldValuePairs } from './utils';
import { NotImplementedYet } from './utils/NotImplementedYet';

/**
 * A write batch, used to perform multiple writes as a single atomic unit.
 *
 * A `WriteBatch` object can be acquired by calling `Firestore.batch()`. It
 * provides methods for adding writes to the write batch. None of the
 * writes will be committed (or visible locally) until `WriteBatch.commit()`
 * is called.
 *
 * Unlike transactions, write batches are persisted offline and therefore are
 * preferable when you don't need to condition your writes on read data.
 */
export class MockWriteBatch implements WriteBatch {
  private transactionData: {
    [documentPath: string]: any;
  } = {};
  private transactionOperation: {
    [documentPath: string]: DocumentChangeType;
  } = {};

  public constructor(public firestore: MockFirebaseFirestore) {}

  /**
   * Writes to the document referred to by the provided `DocumentReference`.
   * If the document does not exist yet, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into the existing document.
   *
   * @param documentRef A reference to the document to be set.
   * @param data An object of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return This `WriteBatch` instance. Used for chaining method calls.
   */
  public set(documentRef: MockDocumentReference, data: DocumentData, options?: SetOptions): WriteBatch {
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
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return This `WriteBatch` instance. Used for chaining method calls.
   */
  public update(
    documentRef: MockDocumentReference,
    dataOrField: UpdateData | string | FieldPath,
    value?: any,
    ...moreFieldsAndValues: any[]
  ): WriteBatch {
    const path = documentRef.path;
    const data = this.transactionData[path] || deepCopy(documentRef.data);

    const fieldType = typeof dataOrField;
    if (fieldType === 'string' || dataOrField instanceof MockFieldPath) {
      // TODO remove repetative code
      const args = parseFieldValuePairsFromArgs([dataOrField, value], moreFieldsAndValues[0]);

      this.transactionData[path] = setFieldValuePairs(this.firestore, data, args);
      this.transactionOperation[path] = 'modified';
      return this;
    }
    if (typeof dataOrField === 'object') {
      this.transactionData[path] = documentRef.updateInTransaction(data, dataOrField, value, moreFieldsAndValues);
      this.transactionOperation[path] = 'modified';
      return this;
    }
    throw new NotImplementedYet('MockTransaction.get');
  }

  /**
   * Deletes the document referred to by the provided `DocumentReference`.
   *
   * @param documentRef A reference to the document to be deleted.
   * @return This `WriteBatch` instance. Used for chaining method calls.
   */
  public delete(documentRef: DocumentReference): WriteBatch {
    const path = documentRef.path;
    this.transactionData[path] = undefined;
    this.transactionOperation[path] = 'removed';
    return this;
  }

  /**
   * Commits all of the writes in this write batch as a single atomic unit.
   *
   * @return A Promise resolved once all of the writes in the batch have been
   * successfully written to the backend as an atomic unit. Note that it won't
   * resolve while you're offline.
   */
  public commit = async (): Promise<void> => {
    const collectionChanges: {
      [collectionId: string]: MockDocumentChange[];
    } = {};
    try {
      const triggers: {
        [path: string]: () => void;
      } = {};

      for (const path in this.transactionOperation) {
        if (this.transactionOperation.hasOwnProperty(path)) {
          const operation = this.transactionOperation[path];
          const doc = this.firestore.doc(path) as MockDocumentReference;

          const documentChange = await doc.commitChange(operation, this.transactionData[path]);
          const collectionPath = path.substr(0, path.lastIndexOf('/'));
          const changes: MockDocumentChange[] = collectionChanges[collectionPath] || [];
          changes.push(documentChange as any); // TODO typing
          collectionChanges[collectionPath] = changes;

          // iterate snapshot callbacks collections and documents
          for (const collectionId in collectionChanges) {
            if (collectionChanges.hasOwnProperty(collectionId)) {
              const documentChanges = collectionChanges[collectionId];
              for (const documentId in documentChanges) {
                if (documentChanges.hasOwnProperty(documentId)) {
                  const document = documentChanges[documentId];
                  triggers[document.doc.ref.path] = () =>
                    document.doc.ref.fireDocumentChangeEvent(
                      document.type,
                      documentChanges[documentId].oldIndex,
                      false
                    );
                }
              }
              const collection = this.firestore.collection(collectionId) as MockCollectionReference;

              triggers[collectionId] = () => {
                collection.fireBatchDocumentChange(documentChanges);
              };
            }
          }
          // tslint:disable-next-line
        }
      }

      // fire triggers
      for (const trigger in triggers) {
        if (triggers.hasOwnProperty(trigger)) {
          triggers.hasOwnProperty(trigger) && triggers[trigger]();
        }
      }
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  private rollback = () => {
    // tslint:disable-next-line: no-console
    console.error('Rollback not implemented yet');
  }
}
