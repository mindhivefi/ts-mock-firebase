import { DocumentSnapshot } from '@firebase/firestore-types';
import { MockFirebaseApp } from '../../firebaseApp';

import { MockDatabase } from '../index';
import MockDocumentReference from '../MockDocumentReference';

describe('Database state restoring', () => {
  describe('Reading the whole database state', () => {
    it('will create the database from an object model', async () => {
      const dogWhisper = (snapshot: DocumentSnapshot) => {
        console.log(snapshot);
      };

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
                        // tslint:disable-next-line: no-duplicate-string
                        photoUrl: 'https://www.cat.com/',
                      },
                    },
                  },
                },
              },
            },
            dog: {
              data: {
                // tslint:disable-next-line: no-duplicate-string
                name: "Santa's little helper",
              },
              listerners: [dogWhisper],
            },
          },
        },
      };

      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(database);

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

      const doc = firestore.doc('animals/dog') as MockDocumentReference;
      expect(doc.mocker.listeners().length).toBe(1);
      expect(doc.mocker.listeners()[0]).toBe(dogWhisper);
    });
    it('will load the database state from a json string', async () => {
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
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromJson(JSON.stringify(database));
      const result = firestore.mocker.toJson();
      expect(result).toMatch(JSON.stringify(database, undefined, 2));
    });
  });

  describe('Saving the whole database state', () => {
    it('will save the database state to an object model', async () => {
      const dogWhisper = (snapshot: DocumentSnapshot) => {
        console.log(snapshot);
      };

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
              listerners: [dogWhisper],
            },
          },
        },
      };

      const storedDatabase: MockDatabase = {
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

      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(database);

      const result = firestore.mocker.toMockDatabase();

      expect(result).toEqual(storedDatabase);
    });

    it('will save the database state into to a json string', async () => {
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

      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);

      const result = firestore.mocker.toJson();

      expect(result).toMatch(JSON.stringify(database, undefined, 2));
    });
  });

  describe('Setting database state by pointing data to paths', () => {
    describe('Collection paths', () => {
      it('Will save documents on the collection in root level', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.reset();
        firestore.mocker.loadCollection('test', {
          doc1: {
            value: 1,
          },
          doc2: {
            value: 2,
          },
        });

        const testRef = firestore.collection('test');

        const doc1 = await testRef.doc('doc1').get();
        const doc2 = await testRef.doc('doc2').get();

        expect(doc1).toBeDefined();
        expect(doc2).toBeDefined();
        expect(doc1.data()).toEqual({
          value: 1,
        });
        expect(doc2.data()).toEqual({
          value: 2,
        });
      });

      it('Will save documents on the collection in sub path level', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.reset();
        firestore.mocker.loadCollection('test/doc/sub', {
          doc1: {
            value: 1,
          },
          doc2: {
            value: 2,
          },
        });

        const testRef = firestore.collection('test/doc/sub');

        const doc1 = await testRef.doc('doc1').get();
        const doc2 = await testRef.doc('doc2').get();

        expect(doc1).toBeDefined();
        expect(doc2).toBeDefined();
        expect(doc1.data()).toEqual({
          value: 1,
        });
        expect(doc2.data()).toEqual({
          value: 2,
        });
      });

      it('Will save multiple collections in diffent paths', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.reset();
        firestore.mocker.loadCollection('test/doc/sub', {
          doc1: {
            value: 1,
          },
          doc2: {
            value: 2,
          },
        });
        firestore.mocker.loadCollection('test2', {
          doc1: {
            value: 1,
          },
          doc2: {
            value: 2,
          },
        });

        const testRef = firestore.collection('test/doc/sub');

        const doc1 = await testRef.doc('doc1').get();
        const doc2 = await testRef.doc('doc2').get();

        expect(doc1).toBeDefined();
        expect(doc2).toBeDefined();
        expect(doc1.data()).toEqual({
          value: 1,
        });
        expect(doc2.data()).toEqual({
          value: 2,
        });

        const test2Ref = firestore.collection('test2');

        const doc2_1 = await test2Ref.doc('doc1').get();
        const doc2_2 = await test2Ref.doc('doc2').get();

        expect(doc2_1).toBeDefined();
        expect(doc2_2).toBeDefined();
        expect(doc2_1.data()).toEqual({
          value: 1,
        });
        expect(doc2_2.data()).toEqual({
          value: 2,
        });
      });

      it('Will save multiple collections in diffent paths that intersect', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.reset();
        firestore.mocker.loadCollection('test', {
          doc1: {
            value: 1,
          },
          doc2: {
            value: 2,
          },
        });
        firestore.mocker.loadCollection('test/doc/sub', {
          doc1: {
            value: 1,
          },
          doc2: {
            value: 2,
          },
        });

        const testRef = firestore.collection('test/doc/sub');

        const doc1 = await testRef.doc('doc1').get();
        const doc2 = await testRef.doc('doc2').get();

        expect(doc1).toBeDefined();
        expect(doc2).toBeDefined();
        expect(doc1.data()).toEqual({
          value: 1,
        });
        expect(doc2.data()).toEqual({
          value: 2,
        });

        const test2Ref = firestore.collection('test');

        const doc2_1 = await test2Ref.doc('doc1').get();
        const doc2_2 = await test2Ref.doc('doc2').get();

        expect(doc2_1).toBeDefined();
        expect(doc2_2).toBeDefined();
        expect(doc2_1.data()).toEqual({
          value: 1,
        });
        expect(doc2_2.data()).toEqual({
          value: 2,
        });
      });
    });

    describe('Document paths', () => {
      it('Will save document on the collection at root level', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.reset();
        firestore.mocker.loadDocument('test/doc1', {
          value: 1,
        });

        const testRef = firestore.doc('test/doc1');

        const doc1 = await testRef.get();

        expect(doc1).toBeDefined();
        expect(doc1.data()).toEqual({
          value: 1,
        });
      });

      it('Will save document on the collection into a sub path', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.reset();
        firestore.mocker.loadDocument('test/subdoc/subcollection/doc1', {
          value: 1,
        });

        const testRef = firestore.doc('test/subdoc/subcollection/doc1');

        const doc1 = await testRef.get();

        expect(doc1).toBeDefined();
        expect(doc1.data()).toEqual({
          value: 1,
        });
      });
    });
  });
});
