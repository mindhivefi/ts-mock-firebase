import { FirebaseAppMock } from 'firebaseApp';
import { FirestoreMock } from 'firestore';
import { MockDatabase } from '../index';

describe('Database state restoring', () => {
  it('Create database from object model', async () => {
    const database: MockDatabase = {
      animals: {
        docs: {
          cat: {
            data: {
              name: 'Fluffy',
            },
            collections: {
              foods: {
                docs: {
                  kitekat: {
                    data: {
                      quantity: 2,
                    },
                  },
                },
              },
              photos: {
                docs: {
                  kitten: {
                    data: {
                      photoUrl: 'https://www.cat.com/',
                    },
                  },
                },
              },
            },
          },
          dog: {
            data: {
              name: "Santa's little helper",
            },
          },
        },
      },
    };

    const app = new FirebaseAppMock();
    const firestore = app.firestore() as FirestoreMock;
    firestore.mocker.loadDatabase(database);

    expect(firestore.doc('animals/dog')).toBeDefined();

    let snap = await firestore.doc('animals/dog').get();
    expect(snap.exists).toBeTruthy();
    expect(snap.data()).toEqual({
      name: "Santa's little helper",
    });

    expect(firestore.doc('animals/cat/foods/kitekat')).toBeDefined();
    snap = await firestore.doc('animals/cat/foods/kitekat').get();
    expect(snap.exists).toBeTruthy();
    expect(snap.data()).toEqual({
      quantity: 2,
    });
  });
});
