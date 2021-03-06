import { QuerySnapshot } from '@firebase/firestore-types';

import { MockDatabase } from '..';
import { createFirebaseNamespace } from '../../app';
import MockTransaction from '../../firestore/MockTransaction';
import MockDocumentSnapshot from '../MockDocumentSnapshot';
import { MockFieldPath } from '../MockFieldPath';
import { MockFieldValue } from '../MockFieldValue';

const firebase = createFirebaseNamespace();
const firestore = firebase.initializeApp({}).firestore();

// tslint:disable-next-line: no-big-function
describe('Transaction handling', () => {
  describe('Handling multiple operations as a single transaction', () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              value: 2,
            },
          },
        },
      },
      b: {
        docs: {
          A: {
            data: {
              text: 'A',
            },
          },
          B: {
            data: {
              text: 'B',
            },
          },
        },
      },
    };

    it('will update operations atomically', async () => {
      firestore.mocker.fromMockDatabase(database);

      let ref2Snap;
      let ref2CollectionSnap: QuerySnapshot | undefined;

      const onRef2DocumentSnapshot = jest.fn(snapshot => {
        ref2Snap = snapshot;
      });
      const onRef2CollectionSnapshot = jest.fn(snapshot => {
        ref2CollectionSnap = snapshot;
      });

      firestore.doc('b/A').onSnapshot(onRef2DocumentSnapshot);
      firestore.collection('b').onSnapshot(onRef2CollectionSnapshot);

      await firestore.runTransaction(async (transaction: MockTransaction) => {
        const ref = firestore.doc('a/first');
        const ref2 = firestore.doc('b/A');

        transaction.update(ref, { test: 'modified' });
        transaction.update(ref2, { text: 'altered' });
        transaction.update(ref2, { value: 3 });
      });

      expect(ref2CollectionSnap).toBeDefined();
      const docChanges = ref2CollectionSnap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('modified');
      expect(ref2Snap).toBeDefined();
    });

    it('will add and update operations atomically', async () => {
      expect(true).toBeTruthy();

      firestore.mocker.fromMockDatabase(database);

      let ref2Snap;
      let ref2CollectionSnap: QuerySnapshot | undefined;

      const onRef2DocumentSnapshot = jest.fn(snapshot => {
        ref2Snap = snapshot;
      });
      const onRef2CollectionSnapshot = jest.fn(snapshot => {
        ref2CollectionSnap = snapshot;
      });

      firestore.doc('b/A').onSnapshot(onRef2DocumentSnapshot);
      firestore.collection('b').onSnapshot(onRef2CollectionSnapshot);

      await firestore.runTransaction(async (transaction: MockTransaction) => {
        const ref = firestore.doc('a/first');
        const ref2 = firestore.doc('b/A');
        const ref3 = firestore.doc('b/C');

        transaction.update(ref, { test: 'modified' });
        transaction.set(ref2, { modified: 'field' }, { merge: true });
        transaction.set(ref3, {
          text: 'added',
          value: 3,
        });
      });

      expect(ref2CollectionSnap).toBeDefined();
      const docChanges = ref2CollectionSnap!.docChanges();
      expect(docChanges.length).toBe(2);
      expect(docChanges[0].type).toMatch('modified');
      expect(docChanges[1].type).toMatch('added');
      expect(ref2Snap).toBeDefined();
    });

    it('will add, update and delete operations atomically', async () => {
      expect(true).toBeTruthy();

      firestore.mocker.fromMockDatabase(database);

      let ref2CollectionSnap: QuerySnapshot | undefined;

      const onRef2CollectionSnapshot = jest.fn(snapshot => {
        ref2CollectionSnap = snapshot;
      });

      firestore.collection('b').onSnapshot(onRef2CollectionSnapshot);

      await firestore.runTransaction(async (transaction: MockTransaction) => {
        const ref = firestore.doc('a/first');
        const ref2 = firestore.doc('b/A');
        const ref3 = firestore.doc('b/C');

        transaction.update(ref, { test: 'modified' });
        transaction.delete(ref2);
        transaction.set(ref3, {
          text: 'added',
          value: 3,
        });
      });

      expect(ref2CollectionSnap).toBeDefined();
      const docChanges = ref2CollectionSnap!.docChanges();
      expect(docChanges.length).toBe(2);
      expect(docChanges[0].type).toMatch('removed');
      expect(docChanges[1].type).toMatch('added');
      expect(onRef2CollectionSnapshot.mock.calls.length).toBe(2);
    });

    it('will get value from document ref if value is not defined in transaction', async () => {
      expect(true).toBeTruthy();

      firestore.mocker.fromMockDatabase(database);

      let result: MockDocumentSnapshot | undefined;

      await firestore.runTransaction(async (transaction: MockTransaction) => {
        const ref = firestore.doc('b/A');

        result = await transaction.get(ref);
      });
      expect(result!.data()).toEqual({
        text: 'A',
      });
    });

    it('will give an error if get is called after updating operations', async () => {
      expect(true).toBeTruthy();

      firestore.mocker.fromMockDatabase(database);

      await firestore.runTransaction(async (transaction: MockTransaction) => {
        const ref = firestore.doc('b/A');
        transaction.set(ref, { test: 'value' });

        expect(async () => transaction.get(ref)).toThrow();
      });
    });
  });

  describe('Update operation variations', () => {
    it('Will update field defined by FieldPath', async () => {
      const database: MockDatabase = {
        a: {
          docs: {
            first: {
              data: {
                sub: {
                  value: 2,
                },
              },
            },
          },
        },
      };
      firestore.mocker.fromMockDatabase(database);

      const ref = firestore.doc('a/first');
      await firestore.runTransaction(async (transaction: MockTransaction) => {
        const fieldPath = new MockFieldPath('sub', 'value');
        transaction.update(ref, fieldPath, 'modified');
      });

      const doc = await ref.get();
      expect(doc.data()).toEqual({
        sub: {
          value: 'modified',
        },
      });
    });
  });
  it('Will update multiple fields defined in arguments with string and FieldPath pointings.', async () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              sub: {
                value: 2,
              },
            },
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const ref = firestore.doc('a/first');
    await firestore.runTransaction(async (transaction: MockTransaction) => {
      const fieldPath = new MockFieldPath('sub', 'value');
      transaction.update(ref, fieldPath, 'modified', 'text', 'cat');
    });

    const doc = await ref.get();
    expect(doc.data()).toEqual({
      sub: {
        value: 'modified',
      },
      text: 'cat',
    });
  });

  it('Will update multiple fields defined in arguments with string and FieldPath pointings.', async () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              sub: {
                value: 2,
                other: 3,
              },
            },
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const ref = firestore.doc('a/first');
    await firestore.runTransaction(async (transaction: MockTransaction) => {
      transaction.update(ref, 'sub.value', 'modified', 'text', 'cat', 'other.sub', 'category');
    });

    const data = ref.mocker.getData();
    expect(data).toEqual({
      sub: {
        value: 'modified',
        other: 3,
      },
      other: {
        sub: 'category',
      },
      text: 'cat',
    });
  });

  it('Will update multiple fields defined in object with string and FieldPath pointings.', async () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              sub: {
                value: 2,
                other: 3,
              },
            },
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const ref = firestore.doc('a/first');
    await firestore.runTransaction(async (transaction: MockTransaction) => {
      transaction.update(ref, {
        'sub.value': 'modified',
        text: 'cat',
        'other.sub': 'category',
      });
    });

    const data = ref.mocker.getData();
    expect(data).toEqual({
      sub: {
        value: 'modified',
        other: 3,
      },
      other: {
        sub: 'category',
      },
      text: 'cat',
    });
  });

  it('Will delete fields defined with FieldValues.', async () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              sub1: {
                value: 1,
              },
              sub2: {
                value: 2,
              },
              sub3: {
                value: 3,
              },
            },
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const ref = firestore.doc('a/first');
    await firestore.runTransaction(async (transaction: MockTransaction) => {
      transaction.update(ref, {
        sub1: MockFieldValue.delete(),
      });
      transaction.update(ref, {
        sub2: MockFieldValue.delete(),
      });
    });

    const doc = await ref.get();
    expect(doc.data()).toEqual({
      sub3: {
        value: 3,
      },
    });
  });

  it('Will delete fields in separate operations targeting a same document.', async () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              sub1: {
                value1: 1,
                value2: 2,
                value3: 3,
              },
            },
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const ref = firestore.doc('a/first');
    await firestore.runTransaction(async (transaction: MockTransaction) => {
      transaction.update(ref, {
        'sub1.value1': MockFieldValue.delete(),
      });
      transaction.update(ref, {
        'sub1.value2': MockFieldValue.delete(),
      });
    });

    const doc = await ref.get();
    expect(doc.data()).toEqual({
      sub1: {
        value3: 3,
      },
    });
  });

  it('Will delete multiple fields from same document inside a transaction.', async () => {
    const database: MockDatabase = {
      a: {
        docs: {
          first: {
            data: {
              sub1: {
                value1: 1,
                value2: 2,
                value3: 3,
              },
            },
          },
        },
      },
    };
    firestore.mocker.fromMockDatabase(database);

    const ref = firestore.doc('a/first');
    await firestore.runTransaction(async (transaction: MockTransaction) => {
      transaction.update(ref, {
        'sub1.value1': MockFieldValue.delete(),
        'sub1.value2': MockFieldValue.delete(),
      });
    });

    const doc = await ref.get();
    expect(doc.data()).toEqual({
      sub1: {
        value3: 3,
      },
    });
  });
});

// TODO oldIndex, newIndex

/*
 * TODO The transaction read a document that was modified outside of the transaction. In this case, the transaction automatically runs again. The transaction is retried a finite number of times.
 * TODO The transaction exceeded the maximum request size of 10 MiB.
 */
