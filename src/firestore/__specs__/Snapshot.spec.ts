import { DocumentChange, QuerySnapshot } from '@firebase/firestore-types';
import { MockFirebaseApp } from 'firebaseApp';
import { MockDatabase, MockFirebaseFirestore } from 'firestore';

describe('Snapshot listeners', () => {
  describe('Triggering changed of documents in Collection Reference', () => {
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
      const firestore = new MockFirebaseApp().firestore() as MockFirebaseFirestore;
      firestore.mocker.loadDatabase(testDb1);

      const collectionRef = firestore.collection('list');
      const documentRef = firestore.doc('list/first');
      let snap: QuerySnapshot | undefined = undefined;

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
      const firestore = new MockFirebaseApp().firestore() as MockFirebaseFirestore;
      firestore.mocker.loadDatabase(testDb1);

      const collectionRef = firestore.collection('list');
      const documentRef = firestore.doc('list/first');
      let snap: QuerySnapshot | undefined = undefined;

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
      const firestore = new MockFirebaseApp().firestore() as MockFirebaseFirestore;
      firestore.mocker.loadDatabase(testDb1);

      const collectionRef = firestore.collection('list');
      const documentRef = firestore.doc('list/forth');
      let snap: QuerySnapshot | undefined = undefined;

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
      const firestore = new MockFirebaseApp().firestore() as MockFirebaseFirestore;
      firestore.mocker.loadDatabase(testDb1);

      const collectionRef = firestore.collection('list');

      let snap: QuerySnapshot | undefined = undefined;

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
});
