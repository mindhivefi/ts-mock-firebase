import { createFirebaseNamespace } from '../../app';
import { MockCollectionReference } from '../MockCollectionReference';
import MockDocumentReference from '../MockDocumentReference';
import { MockFieldPath } from '../MockFieldPath';

import { MockDatabase } from '..';
import { MockDocumentSnapshotCallback } from '../MockDocumentReference';
import MockDocumentSnapshot from '../MockDocumentSnapshot';

const documentPath = 'company/mindhive/skills/coding/technologies';
const firebase = createFirebaseNamespace();
const firestore = firebase.initializeApp({}).firestore();

/* tslint:disable:no-big-function no-identical-functions */
describe('DocumentReferenceMock', () => {
  describe('Paths', () => {
    it('Will return a path to a document', () => {
      const document = firestore.collection('company').doc('mindhive');
      expect(document.path).toMatch('company/mindhive');
    });

    it('Will return a path to a collection', () => {
      const collection = firestore.collection(documentPath);
      expect(collection.path).toMatch(documentPath);
    });
  });

  describe('References', () => {
    it('collection() returns a collection by id', () => {
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      expect(firestore.mocker.collection('test')).toBe(collection);
    });

    it('collection() returns a collection by path', () => {
      const collection = firestore.collection(documentPath);
      const document = firestore.mocker.collection('company').doc('mindhive');
      expect(document.collection('skills/coding/technologies')).toBe(collection);
    });
  });

  describe('set()', () => {
    it('will replace the current data', async () => {
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
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
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
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
        { merge: true }
      );

      expect(document.data).toEqual({
        test: 'data',
        new: 'field',
      });
    });

    it('will not disassemble field.paths -expressions on field names', async () => {
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);

      await document.set(
        {
          'new.field': 'field',
        },
        { merge: true }
      );

      expect(document.data).toEqual({
        test: 'data',
        'new.field': 'field',
      });
    });

    it('will replace the current data', async () => {
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
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
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
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
        { merge: true }
      );

      expect(document.data).toEqual({
        test: 'data',
        new: 'field',
      });
    });

    it('will trigger onSnapshot event listeners', async () => {
      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: MockDocumentSnapshot | undefined;

      const listener: MockDocumentSnapshotCallback = (snapshot: MockDocumentSnapshot<any>) => {
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

    // TODO merge options

    // it('will throw unauthorized exception if write is not allowed', () => {
    //   const firestore = new MockFirebaseApp().firestore();
    //   firestore.mocker.reset();
    //   firestore.mocker.loadCollection('users', {
    //     user1: {
    //       name: 'Johnny',
    //     },
    //     user2: {
    //       name: 'Cash',
    //     },
    //   });

    //   const docRef = firestore.doc('users/user1');
    //   expect.assertions(1);
    //   expect(
    //     docRef.set({
    //       value: 'nada',
    //     })
    //   ).rejects.toMatch('PERMISSION_DENIED');
    // });

    // it('will throw unauthorized exception if create is not allowed', () => {});

    // it('will throw unauthorized exception if update is not allowed', () => {});
  });

  describe('delete()', () => {
    it('will remove the document', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      await document.delete();
      expect(collection.mocker.doc('doc')).toBeUndefined();
    });

    it('will trigger onSnapshot -event after registering a tricker', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: MockDocumentSnapshot | undefined;

      const listener = (snapshot: MockDocumentSnapshot<any>) => {
        snap = snapshot;
      };

      const unsubscribe = document.onSnapshot(listener);

      await document.delete();
      expect(collection.mocker.doc('doc')).toBeUndefined();
      expect(snap!.data()).toBeUndefined();
      expect(snap!.exists).toBeFalsy();

      unsubscribe();
    });
    it('will trigger onSnapshot -event', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      let snap: MockDocumentSnapshot | undefined;

      const listener = (snapshot: MockDocumentSnapshot<any>) => {
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
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
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
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      const snapshot = await document.get();

      expect(snapshot.exists).toBeFalsy();
      expect(snapshot.data()).toBeUndefined();
    });

    it('will read an array type data as an array object', async () => {
      firestore.mocker.reset();
      firestore.mocker.loadDocument('collection/doc', {
        anArray: ['one', 'two', 'three'],
      });

      const result = await firestore.doc('collection/doc').get();
      expect(result.exists).toBeTruthy();

      const data = result.data() as any;

      expect(data.anArray).toBeDefined();
      expect(Array.isArray(data.anArray)).toBeTruthy();
      expect(data.anArray.length).toBe(3);

      data.anArray.push('four');
      expect(data.anArray.length).toBe(4);
    });
  });

  describe('isEqual()', () => {
    it('will identify if the document refence points to itself ', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const document2 = new MockDocumentReference(firestore, 'doc2', collection);
      collection.mocker.setDoc(document2);

      expect(document.isEqual(document)).toBeTruthy();
      expect(document.isEqual(document2)).toBeFalsy();
    });
  });

  describe('onSnapshot()', () => {
    // TODO no onSnapshot call when data has bot been changed
    it('will let user to start and stop listening snapshots', () => {
      firestore.mocker.reset();

      const doc = firestore.doc('test/doc');
      // tslint:disable-next-line: no-empty
      const listener = (snapshot: MockDocumentSnapshot<any>) => { };
      const unsubscribe = doc.onSnapshot(listener);
      expect(unsubscribe).toBeDefined();

      expect(doc.mocker.listeners()).toEqual([listener]);

      unsubscribe();
      expect(doc.mocker.listeners()).toEqual([]);
    });

    it('will trigger once snapshot listener after registration', () => {
      firestore.mocker.reset();

      const doc = firestore.doc('test/doc');
      // tslint:disable-next-line: no-empty
      let triggerCount = 0;
      const listener = (snapshot: MockDocumentSnapshot<any>) => {
        triggerCount++;
      };

      doc.onSnapshot(listener);
      expect(triggerCount).toBe(1);
    });
  });

  describe('update()', () => {
    it('will alter the data and maintain the existing data in the object', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
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
      firestore.mocker.reset();

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

    it('will alter the data with dot delimeted presentation', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);

      await document.update({
        'test2.sub': 'more',
      });
      expect(document.data).toEqual({
        test: 'data',
        test2: {
          sub: 'more',
        },
      });
    });

    it('will field value replaced with a new data with dot delimeted presentation', async () => {
      firestore.mocker.reset();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.mocker.setCollection(collection);
      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);
      const data = {
        test: 'data',
      };
      await document.set(data);
      expect(document.data).toEqual(data);

      await document.update({
        'test.sub': 'more',
      });
      expect(document.data).toEqual({
        test: {
          sub: 'more',
        },
      });
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
      firestore.mocker.fromMockDatabase(database);

      const document = firestore.doc('list/doc');
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
      firestore.mocker.fromMockDatabase(database);

      const document = firestore.doc('list/doc');
      await document.update('test', 'cool', 'test2', 'cooler', 'test3', 'the coolest');

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
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc');
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
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc');
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
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc');
    await document.update(new MockFieldPath('test', 'dive'), 'cool');
    await document.update(new MockFieldPath('test', 'another'), 6);
    await document.update(new MockFieldPath('diverse', 'paths', 'possible'), true);

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

  it('will replace field path to objects when the current field is not an object', async () => {
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
    firestore.mocker.fromMockDatabase(database);

    const document = firestore.doc('list/doc');

    const fieldPath = new MockFieldPath('value', 'sub', 'value');
    await document.update(fieldPath, 'object');

    const data = document.mocker.getData();
    expect(data).toEqual({
      value: {
        sub: {
          value: 'object',
        },
      },
    });
  });
});
