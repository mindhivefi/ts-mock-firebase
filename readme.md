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
