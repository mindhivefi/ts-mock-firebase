import { MockFirebaseApp } from 'firebaseApp';
import { MockDatabase } from 'firestore';
import MockDocumentReference from 'firestore/MockDocumentReference';
import MockFieldValue from 'firestore/MockFieldValue';

describe('FieldValue', () => {
  describe('Delete sentinel', () => {
    const database: MockDatabase = {
      list: {
        docs: {
          a: {
            data: {
              first: 1,
              second: 2,
            },
          },
        },
      },
    };

    it('will delete field from data on the top level', async () => {
      const firestore = new MockFirebaseApp().firestore();

      firestore.mocker.fromMockDatabase(database);
      const ref = firestore.doc('list/a') as MockDocumentReference;

      await ref.update({
        first: MockFieldValue.delete(),
      });

      expect(ref.data).toEqual({
        second: 2,
      });
    });

    // it('will delete field from sub object', async () => {
    //   const firestore = new MockFirebaseApp().firestore();

    //   firestore.mocker.fromMockDatabase(database);
    //   const ref = firestore.doc('list/a') as MockDocumentReference;

    //   await ref.set({
    //     c: {
    //       sub: {
    //         A: 1,
    //         B: 2,
    //         C: 3,
    //       },
    //     },
    //   });
    //   await ref.update({
    //     c: {
    //       B: MockFieldValue.delete(),
    //     },
    //   });

    //   expect(ref.data).toEqual({
    //     first: 1,
    //     second: 2,
    //     c: {
    //       sub: {
    //         A: 1,
    //         C: 3,
    //       },
    //     },
    //   });
    // });
  });
});
