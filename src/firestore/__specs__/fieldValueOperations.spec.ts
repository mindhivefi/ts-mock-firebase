import { createFirebaseNamespace } from '../../app';

import { MockDatabase } from '..';
import { MockFieldPath } from '../MockFieldPath';
import { MockFieldValue } from '../MockFieldValue';
import { MockTimestamp } from '../MockTimestamp';

const firebase = createFirebaseNamespace();
const firestore = firebase.initializeApp({}).firestore();

// tslint:disable-next-line: no-big-function
describe('FieldValue', () => {
  // tslint:disable-next-line: no-big-function
  describe('with object updates', () => {
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
        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a');

        await ref.update({
          first: MockFieldValue.delete(),
        });

        expect(ref.data).toEqual({
          second: 2,
        });
      });

      it('will delete field from sub object', async () => {
        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a');

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
          }
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
        // tslint:disable-next-line: no-duplicate-string
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
          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

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
          firestore.mocker.serverTime = timestamp;

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

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
          firestore.mocker.serverTime = () => timestamp;

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update({
            first: MockFieldValue.serverTimestamp(),
          });

          expect(ref.data.first instanceof MockTimestamp).toBeTruthy();
          expect(timestamp.isEqual(ref.data.first)).toBe(true);
        });
      });
    });

    describe('Array sentinels', () => {
      describe('arrayUnion', () => {
        it('will add a new value to the end of an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.set(
            {
              table: MockFieldValue.arrayUnion([3]),
            },
            {
              merge: true,
            }
          );

          expect(ref.data).toEqual({
            table: [1, 2, 3],
          });
        });

        it('will add only values that does not already exist in an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.set(
            {
              table: MockFieldValue.arrayUnion([2, 3, 4]),
            },
            {
              merge: true,
            }
          );

          expect(ref.data).toEqual({
            table: [1, 2, 3, 4],
          });
        });

        it('will override fieldvalue if it is not an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    nottable: 1,
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.set(
            {
              nottable: MockFieldValue.arrayUnion([3, 4, 5]),
            },
            {
              merge: true,
            }
          );

          expect(ref.data).toEqual({
            nottable: [3, 4, 5],
          });
        });
      });

      describe('arrayRemove', () => {
        it('will remove a value from an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.set(
            {
              table: MockFieldValue.arrayRemove([1]),
            },
            {
              merge: true,
            }
          );

          expect(ref.data).toEqual({
            table: [2],
          });
        });

        it('will remove all values that does exist in an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.set(
            {
              table: MockFieldValue.arrayRemove([1, 2, 3, 4]),
            },
            {
              merge: true,
            }
          );

          expect(ref.data).toEqual({
            table: [],
          });
        });

        it('will override field value with an empty array if it is not an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    nottable: 1,
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.set(
            {
              nottable: MockFieldValue.arrayRemove([3, 4, 5]),
            },
            {
              merge: true,
            }
          );

          expect(ref.data).toEqual({
            nottable: [],
          });
        });
      });
    });
  });

  // tslint:disable-next-line: no-big-function
  describe('with field path updates', () => {
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
        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a');

        await ref.update('first', MockFieldValue.delete());

        expect(ref.data).toEqual({
          second: 2,
        });
      });

      it('will delete field pointed with Field Path from data on the top level', async () => {
        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a');

        await ref.update(new MockFieldPath('first'), MockFieldValue.delete());

        expect(ref.data).toEqual({
          second: 2,
        });
      });

      it('will delete field from sub object', async () => {
        firestore.mocker.fromMockDatabase(database);
        const ref = firestore.doc('list/a');

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
          }
        );
        await ref.update(new MockFieldPath('third', 'sub', 'B'), MockFieldValue.delete());

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

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('first', MockFieldValue.serverTimestamp());

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
          firestore.mocker.serverTime = timestamp;

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('first', MockFieldValue.serverTimestamp());

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
          firestore.mocker.serverTime = () => timestamp;

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('first', MockFieldValue.serverTimestamp());

          expect(ref.data.first instanceof MockTimestamp).toBeTruthy();
          expect(timestamp.isEqual(ref.data.first)).toBe(true);
        });
      });
    });

    describe('Array sentinels', () => {
      describe('arrayUnion', () => {
        it('will add a new value to the end of an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('table', MockFieldValue.arrayUnion([3]));

          expect(ref.data).toEqual({
            table: [1, 2, 3],
          });
        });

        it('will add only values that does not already exist in an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update(new MockFieldPath('table'), MockFieldValue.arrayUnion([2, 3, 4]));

          expect(ref.data).toEqual({
            table: [1, 2, 3, 4],
          });
        });

        it('will override fieldvalue if it is not an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    nottable: 1,
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('nottable', MockFieldValue.arrayUnion([3, 4, 5]));

          expect(ref.data).toEqual({
            nottable: [3, 4, 5],
          });
        });
      });

      describe('arrayRemove', () => {
        it('will remove a value from an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('table', MockFieldValue.arrayRemove([1]));

          expect(ref.data).toEqual({
            table: [2],
          });
        });

        it('will remove all values that does exist in an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    table: [1, 2],
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('table', MockFieldValue.arrayRemove([1, 2, 3, 4]));

          expect(ref.data).toEqual({
            table: [],
          });
        });

        it('will override field value with an empty array if it is not an array', async () => {
          const database: MockDatabase = {
            list: {
              docs: {
                a: {
                  data: {
                    nottable: 1,
                  },
                },
              },
            },
          };

          firestore.mocker.fromMockDatabase(database);
          const ref = firestore.doc('list/a');

          await ref.update('nottable', MockFieldValue.arrayRemove([3, 4, 5]));

          expect(ref.data).toEqual({
            nottable: [],
          });
        });
      });
    });
  });

  describe('isEqual', () => {
    it('will match two delete sentinels', () => {
      const sentinel = MockFieldValue.delete();
      expect(sentinel.isEqual(MockFieldValue.delete())).toBe(true);
    });
    it('will match two timestamp sentinels', () => {
      const sentinel = MockFieldValue.serverTimestamp();
      expect(sentinel.isEqual(MockFieldValue.serverTimestamp())).toBe(true);
    });
    it('will not match when matching sentinels of different type', () => {
      const sentinel = MockFieldValue.serverTimestamp();
      expect(sentinel.isEqual(MockFieldValue.delete())).toBe(false);
    });

    it('will match identical arrayUnions', () => {
      const sentinel = MockFieldValue.arrayUnion([1, 2, 3]);
      expect(sentinel.isEqual(MockFieldValue.arrayUnion([1, 2, 3]))).toBe(true);
    });
    it('will not match unidentical arrayUnions', () => {
      const sentinel = MockFieldValue.arrayUnion([1, 2, 3]);
      expect(sentinel.isEqual(MockFieldValue.arrayUnion([1, 4, 3]))).toBe(false);
    });
    it('will not match arrayUnions of different length', () => {
      const sentinel = MockFieldValue.arrayUnion([1, 3]);
      expect(sentinel.isEqual(MockFieldValue.arrayUnion([1, 4, 3]))).toBe(false);
    });

    it('will match identical arrayRemoves', () => {
      const sentinel = MockFieldValue.arrayRemove([1, 2, 3]);
      expect(sentinel.isEqual(MockFieldValue.arrayRemove([1, 2, 3]))).toBe(true);
    });
    it('will not match unidentical arrayRemoves', () => {
      const sentinel = MockFieldValue.arrayRemove([1, 2, 3]);
      expect(sentinel.isEqual(MockFieldValue.arrayRemove([1, 4, 3]))).toBe(false);
    });
    it('will not match arrayRemoves of different length', () => {
      const sentinel = MockFieldValue.arrayRemove([1, 3]);
      expect(sentinel.isEqual(MockFieldValue.arrayRemove([1, 4, 3]))).toBe(false);
    });
  });
});
