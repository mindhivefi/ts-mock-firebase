import { DocumentSnapshot } from '@firebase/firestore-types';
import { MockFirebaseApp } from 'firebaseApp';
import { MockCollectionReference } from 'firestore/MockCollectionReference';
import MockDocumentReference from 'firestore/MockDocumentReference';
import MockFieldPath from 'firestore/MockFieldPath';

import { MockDatabase } from '..';
import { MockDocumentSnapshotCallback } from '../MockDocumentReference';

const documentPath = 'company/mindhive/skills/coding/technologies';

/* tslint:disable:no-big-function no-identical-functions */
describe('DocumentReferenceMock', () => {
  describe('Paths', () => {
    it('Will return a path to a document', () => {
      const firestore = new MockFirebaseApp().firestore();
      const document = firestore.collection('company').doc('mindhive');
      expect(document.path).toMatch('company/mindhive');
    });

    it('Will return a path to a collection', () => {
      const firestore = new MockFirebaseApp().firestore();
      const collection = firestore.collection(documentPath);
      expect(collection.path).toMatch(
        'company/mindhive/skills/coding/technologies',
      );
    });
  });

  describe('Refrences', () => {
    it('collection() returns a collection by id', () => {
      const firestore = new MockFirebaseApp().firestore();
      const document = firestore.root;

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);

      expect(document.collection('test')).toBe(collection);
    });

    it('collection() returns a collection by path', () => {
      const firestore = new MockFirebaseApp().firestore();

      const collection = firestore.collection(
        'company/mindhive/skills/coding/technologies',
      );
      const document = firestore.root.collection('company').doc('mindhive');

      expect(document.collection('skills/coding/technologies')).toBe(
        collection,
      );
    });
  });

  describe('set()', () => {
    it('will replace the current data', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);
      expect(firestore.doc('test/doc')).toBe(document);
    });

    it('will only update defined fields if merge options set to true', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);

      await document.set(
        {
          new: 'field',
        },
        { merge: true },
      );

      expect(document.data).toEqual({
        test: 'data',
        new: 'field',
      });
    });

    it('will trigger onSnapshot event listeners', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: DocumentSnapshot | undefined = undefined;

      const listener: MockDocumentSnapshotCallback = (
        snapshot: DocumentSnapshot,
      ) => {
        snap = snapshot;
      };

      const unsubscribe = document.onSnapshot(listener);

      const data = {
        test: 'data',
      };
      await document.set(data);

      expect(document.data).toEqual(data);
      expect(snap).toBeDefined();
      expect(snap!.exists).toBeDefined();
      expect(snap!.data()).toEqual(data);

      unsubscribe();
    });

    // TOTO merge options
  });

  describe('delete()', () => {
    it('will remove the document', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      await document.delete();
      expect(collection.mocker.doc('doc')).toBeUndefined();
    });

    it('will trigger onSnapshot -event', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: DocumentSnapshot | undefined = undefined;

      const listener: MockDocumentSnapshotCallback = (
        snapshot: DocumentSnapshot,
      ) => {
        snap = snapshot;
      };

      const unsubscribe = document.onSnapshot(listener);

      await document.delete();
      expect(collection.mocker.doc('doc')).toBeUndefined();
      expect(snap!.data()).toBeUndefined();
      expect(snap!.exists).toBeFalsy();

      unsubscribe();
    });
  });

  describe('get()', () => {
    it('will get snapshot with data', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      const snapshot = await document.get();

      expect(snapshot.exists).toBeTruthy();
      expect(snapshot.data()).toEqual(data);
    });

    it('will get snapshot with exists = false if document does not exists', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      const snapshot = await document.get();

      expect(snapshot.exists).toBeFalsy();
      expect(snapshot.data()).toBeUndefined();
    });
  });

  describe('isEqual()', () => {
    it('will identify if the document refence points to itself ', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const document2 = new MockDocumentReference(
        firestore,
        'doc2',
        collection,
      );
      collection.mocker.setDoc(document2);

      expect(document.isEqual(document)).toBeTruthy();
      expect(document.isEqual(document2)).toBeFalsy();
    });
  });

  describe('onSnapshot()', () => {
    it('will let user to start and stop listening snapshots', () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      const doc = firestore.doc('test/doc') as MockDocumentReference;
      const listener = (snapshot: DocumentSnapshot) => {
        console.log(snapshot);
      };
      const unsubscribe = doc.onSnapshot(listener);
      expect(unsubscribe).toBeDefined();

      expect(doc.mocker.listeners()).toEqual([listener]);

      unsubscribe();
      expect(doc.mocker.listeners()).toEqual([]);
    });
  });

  describe('update()', () => {
    it('will alter the data', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);

      await document.update({
        test2: 'more',
      });
      expect(document.data).toEqual({
        test: 'data',
        test2: 'more',
      });
    });

    it('will fail if document do not exist', async () => {
      const firestore = new MockFirebaseApp().firestore();
      const document = firestore.doc('test/doc');

      expect.assertions(1);
      try {
        await document.update({
          test2: 'more',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('will alter the data with simple key-value pair', async () => {
      const database: MockDatabase = {
        list: {
          docs: {
            doc: {
              data: {
                value: 1,
              },
            },
          },
        },
      };
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);

      const document = firestore.doc('list/doc') as MockDocumentReference;
      await document.update('test', 'cool');

      expect(document.data).toEqual({
        value: 1,
        test: 'cool',
      });
    });

    it('will alter the data with multiple key-value pairs', async () => {
      const database: MockDatabase = {
        list: {
          docs: {
            doc: {
              data: {
                value: 1,
              },
            },
          },
        },
      };
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);

      const document = firestore.doc('list/doc') as MockDocumentReference;
      await document.update(
        'test',
        'cool',
        'test2',
        'cooler',
        'test3',
        'the coolest',
      );

      expect(document.data).toEqual({
        value: 1,
        test: 'cool',
        test2: 'cooler',
        test3: 'the coolest',
      });
    });
  });

  it('will alter the data with simple FieldPath', async () => {
    const database: MockDatabase = {
      list: {
        docs: {
          doc: {
            data: {
              value: 1,
            },
          },
        },
      },
    };
    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc') as MockDocumentReference;
    await document.update(new MockFieldPath('test'), 'cool');

    expect(document.data).toEqual({
      value: 1,
      test: 'cool',
    });
  });

  it('will alter the data with FieldPath to sub object', async () => {
    const database: MockDatabase = {
      list: {
        docs: {
          doc: {
            data: {
              value: 1,
            },
          },
        },
      },
    };
    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc') as MockDocumentReference;
    await document.update(new MockFieldPath('test', 'dive'), 'cool');

    expect(document.data).toEqual({
      value: 1,
      test: {
        dive: 'cool',
      },
    });
  });

  it('will alter the data with with multiple FieldPath value pairs', async () => {
    const database: MockDatabase = {
      list: {
        docs: {
          doc: {
            data: {
              value: 1,
            },
          },
        },
      },
    };
    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc') as MockDocumentReference;
    await document.update(new MockFieldPath('test', 'dive'), 'cool');
    await document.update(new MockFieldPath('test', 'another'), 6);
    await document.update(
      new MockFieldPath('diverse', 'paths', 'possible'),
      true,
    );

    expect(document.data).toEqual({
      value: 1,
      test: {
        dive: 'cool',
        another: 6,
      },
      diverse: {
        paths: {
          possible: true,
        },
      },
    });
  });

  it('will fail if field path points to non object field', async () => {
    const database: MockDatabase = {
      list: {
        docs: {
          doc: {
            data: {
              value: 1,
            },
          },
        },
      },
    };
    const firestore = new MockFirebaseApp().firestore();
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc') as MockDocumentReference;

    await expect(
      document.update(new MockFieldPath('value', 'crash'), 'will it?'),
    ).rejects.toThrow();
  });
});
