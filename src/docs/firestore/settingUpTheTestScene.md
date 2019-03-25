# Setting the test scene

ts-mock-firebase supports to basic ways to set up the initial database state for testing. You can read the whole state of the database from an object or on json file or then you can set up the scene by setting collections and single documents with direct path pointings. You can also combine these to ways to setting up the state.

One important thing to understand is that this mock library have a singleton instance of firebase in memory. So it is important that you will call mocker reset before every test in following way:

```typescript
firestore.mocker.reset(); // this will reset the whole database into an initial state
```

## Setting database state by setting document into a paths

In basic test cases, it is might be the easiest way to just set the required firestore document into database with `loadDocument` and `loadCollection` -mocker functions.

### mocker.loadDocument

Load document will load a single document data into a given path:

```typescript
firestore.mocker.loadDocument('path/to/my/document', {
  title: 'This is my document data',
});
```

The line above will add a document into database. All parent collections and document are autocreated, if needed.

### mocker.loadCollection

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
