import { mockFirebase } from '../../';
import '../firestore';

const firebase = mockFirebase();

firebase.initializeApp({
  apiKey: '### FIREBASE API KEY ###',
  authDomain: '### FIREBASE AUTH DOMAIN ###',
  projectId: '### CLOUD FIRESTORE PROJECT ID ###',
});

const db = firebase.firestore();

export default db;
