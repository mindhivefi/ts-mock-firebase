# Ts-Mock-Firebase

[![Greenkeeper badge](https://badges.greenkeeper.io/mindhivefi/ts-mock-firebase.svg)](https://greenkeeper.io/)

Ts-Mock-Firebase is a mocking library to help testing Firebase projects. It is especially handy for developers using Typescript. All mocking classes implements the actual Firebase interfaces.

Firebase is a great service which improves the development speed and it also makes it possible to build services that would be really big challenge to build otherways. At the same time, largely scalable environments with possibly millons of users really need a professional level development tools for testing. This kind of tools have been missing from Firebase comminity. This project's goal is to build this kind of professional tools to test thoroughly Firebase applications.

The philosophy with Ts-Mock-Firebase is to emulate the whole functionality of Firebase as an inmemory instance. This will make it possible to set up an unique state for each test and test all consequences expected for each case. Another philosophical point is to support all typescript interfaces offered by Firebase libraries to make it easier to developers to develop the actual code with a strong testing tool.

This mocking library is not itself specialized to any unit testing tool framewoork. You should be able to use it with jest, mocha or any other testing library. 

NOTE - Current version is still in early alpha and only supports Firestore. All features of Firestore are already supported, altought there are cases like with onSnapshot -callbacks, where all possible ways are not yet covered.

## Mocking Firebase with Jest

Easiest way to mock with jest is to use is to define a file with a module name into `__mocks__` -folder under the source root folder. This way all times your code will use the module, it will be mocked on every jest unit test. To do that for `firestore` -module, do as follows:

Create a file to `[SOURCE_ROOT]/__mocks__/firebase.ts`, with content:

```typescript
import { mockFirebase } from 'ts-mock-firebase';

const firebase = mockFirebase();

export = firebase;
```

After this, all your jest unit tests will use ts-mock-firebase instead of the actual one. To do the same for `firebase-admin`, just create a file with name `firebase-admin` and user `mockFirebaseAdmin` -function instead:

Create a file to `[SOURCE_ROOT]/__mocks__/firebase-admin.ts`, with content:

```typescript
import { mockFirebaseAdmin } from 'ts-mock-firebase';

const firebaseAdmin = mockFirebaseAdmin();

export = firebaseAdmin;
```

To get an access to mock operation in your jest code, you must expose the module:

```typescript
// in my.test.ts or my.spec.ts -file:

import * as firebase from 'firebase';
import { exposeMockFirebase } from 'ts-mock-firebase';

// your app instance (normally created in a different module, but here as an example)
const app = firebase.initializeApp({});

// expose mock interface to make it possible to set up the database state
const mocked = exposeMockFirebase(app);

// now, you will have an access to mocked Firebase's extrafeatures like:
mocked.firestore().mocker.fromMockDatabase(database);

```

## Setting the test scene

ts-mock-firebase supports two basic ways for setting up the initial database state for testing. You can read the whole state of the database from an object or on json file, or then you can set up the scene by setting collections and single documents with direct path pointings. You can also combine these to ways to setting up the state.

If you are using a same instance of mock database in several tests, it is important that you will call `mocker.reset()` before each test to reset the database:

```typescript
firestore.mocker.reset(); // this will reset the whole database into an initial state
```

### Setting database state by setting document into a paths

In basic test cases, it might be easiest to just set the required firestore document into the database with `loadDocument` and `loadCollection` -mocker functions.

#### mocker.loadDocument

Load document will load a single document data into a given path:

```typescript
firestore.mocker.loadDocument('path/to/my/document', {
  title: 'This is my document data',
});
```

The line above will add a document into database. All parent collections and document are autocreated, if needed.

#### mocker.loadCollection

You can also load a full collection of documents with loadCollection -method:

```typescript
firestore.mocker.loadCollection('path/to/collection', {
  doc1: {
    title: 'content of the first document in collection',
  },
  doc2: {
    title: 'content of the second document in collection',
    value: 2,
  }
});
```

Load collection works just like loadDocument except that the object's first level fields define the name of the document and the leaves under that are the data of the document.

## Loading the whole database state at once

Each mock class is named after the actual Firebase class prefixed with Mock, like `MockDocumentReference` or `MockFirebaseFirestore`. Mock classes have a special `mocker` -object that can be used to manipulate the database state related to object.

To create an initial database for testing, you can use a `MockDatabase` -interface as follows:

```typescript
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
```

The code above will define first a mock database object. Then the firestore's mocker object is been used to load the database into firestore mock object.
