# Mock-Firebase

Mock firebase is mocking library to help testing Firebase projects. It is especially handy for developers using Typescript. All mocking classes implements the actual Firebase interfaces.

Current version is still in early alpha and currently supports only Firestore. All features of Firestore are already supported, altough there are cases like with onSnapshot -callbacks, that all possible ways to use are not covered.

The philosophy with Mock-Firebase is to support all typescript interfaces offered by Firebase libraries. The mock itself is not specialized to any unit testing tool, instead the idea is to use it together unit test environment specific helper library.

## Mock-Firestore

Firestore mock supports currently:

- All references for doc and collections
- FieldPaths
- All FieldValue -sentinels
- Queries with `where()`, `orderBy()`, `limit()`, `startAt()`, `startAfter()`, `endBefore()` and `endAt()` are all supported.
- All document manipulation and reading operations are supported
- Transactions and WriteBatches are supported

## Setting the test scene

ts-mock-firebase supports to basic ways to set up the initial database state for testing. You can read the whole state of the database from an object or on json file or then you can set up the scene by setting collections and single documents with direct path pointings. You can also combine these to ways to setting up the state.

One important thing to understand is that this mock library have a singleton instance of firebase in memory. So it is important that you will call mocker reset before every test in following way:

```typescript
firestore.mocker.reset(); // this will reset the whole database into an initial state
```

### Setting database state by setting document into a paths

In basic test cases, it is might be the easiest way to just set the required firestore document into the database with `loadDocument` and `loadCollection` -mocker functions.

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

Each mock class is named after the actual Firebase class prefixed with Mock, like `MockDocumentReference` or `MockFirebaseFirestore`. Mock classes have a special mocker -object that can be used to manipulate the initial state. Basic usage to create a mock Firestore instance, is been done in a following way:

```typescript
const firestore = new MockFirebaseApp().firestore();
```

This will create a emulated firestore instance that will acts just like the real firestore is working.

To create an initial database for testing, you can use a MockDatabase -interface as follows:

```typescript
const firestore = new MockFirebaseApp().firestore();
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
