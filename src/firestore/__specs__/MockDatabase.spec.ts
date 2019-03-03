import { DocumentSnapshot } from '@firebase/firestore-types';
import { MockFirebaseApp } from 'firebaseApp';

import MockDocumentReference from 'firestore/MockDocumentReference';
import { MockDatabase } from '../index';

describe('Database state restoring', () => {
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
