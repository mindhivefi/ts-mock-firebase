import { FirebaseAppMock } from '../../firebaseApp';

describe('Firestore references', () => {
  describe('Collection References', () => {
    it('Will return a reference to collection', () => {
      const app = new FirebaseAppMock();

      const firestore = app.firestore();
      const ref = firestore.collection('users');
      expect(ref).toBeDefined();
    });

    // describe('Reference paths', () => {
    //   it('Collections has equal path', () => {
    //     const app = new FirebaseAppMock();

    //     const firestore = app.firestore();
    //     const ref = firestore.collection('company/mindhive/users/ville');
    //     expect(ref.path).toMatch('company/mindhive/users/ville');
    //   });
    // });
  });
});
