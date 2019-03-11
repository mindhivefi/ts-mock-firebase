import { MockFirebaseApp } from 'firebaseApp';
import { MockDatabase } from 'firestore';
import MockDocumentReference from 'firestore/MockDocumentReference';
import MockFieldValue from 'firestore/MockFieldValue';
import MockTimestamp from 'firestore/MockTimestamp';

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

    it('will delete field from sub object', async () => {
      const firestore = new MockFirebaseApp().firestore();

      firestore.mocker.fromMockDatabase(database);
      const ref = firestore.doc('list/a') as MockDocumentReference;

      await ref.set(
        {
          third: {
            sub: {
              A: 1,
              B: 2,
              C: 3,
            },
          },
        },
        {
          merge: true,
        },
      );
      await ref.update({
        third: {
          sub: {
            B: MockFieldValue.delete(),
          },
        },
      });

      expect(ref.data).toEqual({
        first: 1,
        second: 2,
        third: {
          sub: {
            A: 1,
            C: 3,
          },
        },
      });
    });

    // TODO fieldPath updates and sets with field values
  });
  describe('Timestamp sentinel', () => {
    describe('No server time defined', () => {
      it('will replace sentinels with timestamps', async () => {
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
        const firestore = new MockFirebaseApp().firestore();

        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a') as MockDocumentReference;

        await ref.update({
          first: MockFieldValue.serverTimestamp(),
        });

        expect(ref.data.first instanceof MockTimestamp).toBeTruthy();
      });
    });

    describe('Server time mocked with MockTimestamp value', () => {
      it('will replace sentinels with timestamps', async () => {
        const timestamp = MockTimestamp.fromDate(new Date('2019-03-11 20:47'));
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
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.serverTime = timestamp;

        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a') as MockDocumentReference;

        await ref.update({
          first: MockFieldValue.serverTimestamp(),
        });

        expect(ref.data.first instanceof MockTimestamp).toBeTruthy();
        expect(timestamp.isEqual(ref.data.first)).toBe(true);
      });
    });

    describe('Server time mocked with a function', () => {
      it('will replace sentinels with timestamps', async () => {
        const timestamp = MockTimestamp.fromDate(new Date('2019-03-11 21:47'));
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
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.serverTime = () => timestamp;

        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a') as MockDocumentReference;

        await ref.update({
          first: MockFieldValue.serverTimestamp(),
        });

        expect(ref.data.first instanceof MockTimestamp).toBeTruthy();
        expect(timestamp.isEqual(ref.data.first)).toBe(true);
      });
    });
  });
});
