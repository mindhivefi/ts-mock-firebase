import firebase from '../';

describe('Firebase namespace', () => {
  it('will create an instance of firebase namespace', () => {
    expect(firebase).toBeDefined();
  });
});

describe('FirebaseApp', () => {
  it('will create a default instance', () => {
    const app = firebase.initializeApp({});
    expect(app).toBeDefined();
  });
});
