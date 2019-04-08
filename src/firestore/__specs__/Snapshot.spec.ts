import { DocumentChange, QuerySnapshot } from '@firebase/firestore-types';
import { MockDatabase } from '..';
import { createFirebaseNamespace } from '../../app';

const firebase = createFirebaseNamespace();
const firestore = firebase.initializeApp({}).firestore();

describe('Snapshot listeners', () => {
  describe('Triggering changed of documents in Collection References', () => {
    const testDb1: MockDatabase = {
      list: {
        docs: {
          first: {
            data: {
              name: 'first',
            },
          },
          second: {
            data: {
              name: 'second',
            },
          },
          third: {
            data: {
              name: 'second',
            },
          },
        },
      },
    };

    it('will trigger update when document is changed', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const collectionRef = firestore.collection('list');
      const documentRef = firestore.doc('list/first');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      collectionRef.onSnapshot(onSnapshot);

      await documentRef.update({
        name: 'modified',
      });

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(3);
      expect(snap!.docs[0].data()).toEqual({
        name: 'modified',
      });
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('modified');
      expect(docChanges[0].doc).toBe(snap!.docs[0]);
      expect(docChanges[0].oldIndex).toBe(0);
      expect(docChanges[0].newIndex).toBe(0);
    });

    it('will trigger removed when document is deleted', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const collectionRef = firestore.collection('list');
      const documentRef = firestore.doc('list/first');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      collectionRef.onSnapshot(onSnapshot);

      await documentRef.delete();

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(2);
      expect(snap!.docs[0].data()).toEqual({
        name: 'second',
      });
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('removed');
      expect(docChanges[0].doc.id).toMatch('first');
      expect(docChanges[0].oldIndex).toBe(0);
      expect(docChanges[0].newIndex).toBe(-1);
    });

    it('will trigger added when document is set by a new reference', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const collectionRef = firestore.collection('list');
      const documentRef = firestore.doc('list/forth');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      collectionRef.onSnapshot(onSnapshot);

      await documentRef.set({
        name: 'newbie',
      });

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(4);
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('added');
      expect(docChanges[0].doc.id).toMatch('forth');
      expect(docChanges[0].oldIndex).toBe(-1);
      expect(docChanges[0].newIndex).toBeGreaterThanOrEqual(0);
    });

    it('will trigger added when document is added from CollectioReference', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const collectionRef = firestore.collection('list');

      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      collectionRef.onSnapshot(onSnapshot);

      await collectionRef.add({
        name: 'newbie',
      });

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(4);
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('added');
      expect(docChanges[0].doc.id).toBeDefined();
      expect(docChanges[0].oldIndex).toBe(-1);
      expect(docChanges[0].newIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Triggering changed of documents in Query References', () => {
    const testDb1: MockDatabase = {
      list: {
        docs: {
          first: {
            data: {
              name: 'first',
              value: 1,
            },
          },
          second: {
            data: {
              name: 'second',
              value: 2,
            },
          },
          third: {
            data: {
              name: 'third',
              value: 3,
            },
          },
          fourth: {
            data: {
              name: 'fourth',
              value: 4,
            },
          },
        },
      },
    };

    it('will trigger update when document in query is changed', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore.collection('list').where('value', '>=', 3);
      const documentRef = firestore.doc('list/fourth');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      queryRef.onSnapshot(onSnapshot);

      await documentRef.update({
        name: 'modified',
      });

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(2);
      expect(snap!.docs[1].data()).toEqual({
        name: 'modified',
        value: 4,
      });
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('modified');
      // expect(docChanges[0].doc).toBe(snap!.docs[0]);
      expect(docChanges[0].oldIndex).toBe(1);
      expect(docChanges[0].newIndex).toBe(1);
    });

    it('will not trigger update when document does not match the query', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore.collection('list').where('value', '>=', 3);
      const documentRef = firestore.doc('list/first');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = jest.fn((snapshot: QuerySnapshot) => {
        snap = snapshot;
      });

      queryRef.onSnapshot(onSnapshot);

      await documentRef.update({
        name: 'modified',
      });

      expect(snap).toBeUndefined();
      expect(onSnapshot.mock.calls.length).toBe(0);
    });

    it('will trigger an added evenet, when new document is been added in a query range', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore
        .collection('list')
        .where('value', '>=', 3)
        .orderBy('value');
      const documentRef = firestore.doc('list/fifth');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      queryRef.onSnapshot(onSnapshot);

      await documentRef.set({
        name: 'in set',
        value: 3.5,
      });

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(3);
      expect(snap!.docs[1].data()).toEqual({
        name: 'in set',
        value: 3.5,
      });
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('added');
      // expect(docChanges[0].doc).toBe(snap!.docs[0]);
      expect(docChanges[0].oldIndex).toBe(-1);
      expect(docChanges[0].newIndex).toBe(1);
    });

    it('will not trigger an added event, when new document is been added outside of the query range', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore
        .collection('list')
        .where('value', '>=', 3)
        .orderBy('value');
      const collectionRef = firestore.collection('list');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = jest.fn((snapshot: QuerySnapshot) => {
        snap = snapshot;
      });

      queryRef.onSnapshot(onSnapshot);

      await collectionRef.add({
        name: 'modified',
        value: 0,
      });

      expect(snap).toBeUndefined();
      expect(onSnapshot.mock.calls.length).toBe(0);
    });

    it('will trigger an removed event, when a document is been deleted in a query range', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore
        .collection('list')
        .where('value', '>=', 3)
        .orderBy('value');
      const documentRef = firestore.doc('list/third');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = (snapshot: QuerySnapshot) => {
        snap = snapshot;
      };
      queryRef.onSnapshot(onSnapshot);

      await documentRef.delete();

      expect(snap).toBeDefined();
      expect(snap!.docs.length).toBe(1);
      expect(snap!.docs[0].data()).toEqual({
        name: 'fourth',
        value: 4,
      });
      const docChanges: DocumentChange[] = snap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('removed');
      expect(docChanges[0].oldIndex).toBe(0);
      expect(docChanges[0].newIndex).toBe(-1);
    });

    it('will not trigger a removed event, when deleted document is been removed outside of the query range', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore
        .collection('list')
        .where('value', '>=', 3)
        .orderBy('value');
      const documentRef = firestore.doc('list/first');
      let snap: QuerySnapshot | undefined;

      const onSnapshot = jest.fn((snapshot: QuerySnapshot) => {
        snap = snapshot;
      });

      queryRef.onSnapshot(onSnapshot);

      await documentRef.delete();

      expect(snap).toBeUndefined();
      expect(onSnapshot.mock.calls.length).toBe(0);
    });
  });

  describe('Triggering changed of documents to multiple targets', () => {
    const testDb1: MockDatabase = {
      list: {
        docs: {
          first: {
            data: {
              name: 'first',
              value: 1,
            },
          },
          second: {
            data: {
              name: 'second',
              value: 2,
            },
          },
          third: {
            data: {
              name: 'third',
              value: 3,
            },
          },
          fourth: {
            data: {
              name: 'fourth',
              value: 4,
            },
          },
        },
      },
    };

    it('will trigger update to multiple query listeners, when document in query is changed', async () => {
      firestore.mocker.fromMockDatabase(testDb1);

      const queryRef = firestore.collection('list').where('value', '>=', 3);
      const orderedQueryRef = queryRef.orderBy('value');
      const documentRef = firestore.doc('list/fourth');

      let querySnap: QuerySnapshot | undefined;
      const onQuerySnapshot = jest.fn((snapshot: QuerySnapshot) => {
        querySnap = snapshot;
      });
      queryRef.onSnapshot(onQuerySnapshot);

      let orderedSnap: QuerySnapshot | undefined;
      const onOrderedQuerySnapshot = jest.fn((snapshot: QuerySnapshot) => {
        orderedSnap = snapshot;
      });
      orderedQueryRef.onSnapshot(onOrderedQuerySnapshot);

      await documentRef.update({
        name: 'modified',
      });

      expect(querySnap).toBeDefined();
      expect(orderedSnap).toBeDefined();
      expect(querySnap!.docs.length).toBe(2);
      expect(orderedSnap!.docs.length).toBe(2);
      expect(querySnap!.docs[1].data()).toEqual({
        name: 'modified',
        value: 4,
      });
      expect(orderedSnap!.docs[1].data()).toEqual({
        name: 'modified',
        value: 4,
      });
      let docChanges: DocumentChange[] = querySnap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('modified');
      expect(docChanges[0].oldIndex).toBe(1);
      expect(docChanges[0].newIndex).toBe(1);
      docChanges = orderedSnap!.docChanges();
      expect(docChanges.length).toBe(1);
      expect(docChanges[0].type).toMatch('modified');
      expect(docChanges[0].oldIndex).toBe(1);
      expect(docChanges[0].newIndex).toBe(1);

      expect(onQuerySnapshot.mock.calls.length).toBe(1);
      expect(onOrderedQuerySnapshot.mock.calls.length).toBe(1);
    });
  });
});
