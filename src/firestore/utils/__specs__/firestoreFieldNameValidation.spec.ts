import {
  isValidCollectionReference,
  isValidDocumentId,
  isValidDocumentReference,
  isValidFirestoreFieldName,
  isValidFirestoreFieldPath,
} from '..';

describe('Document id validation', () => {
  it('Must be valid UTF-8 characters', () => {
    expect(isValidDocumentId('\u0000')).toBeFalsy();
    expect(isValidDocumentId('abc123')).toBeTruthy();
    expect(isValidDocumentId('äöÅ')).toBeTruthy();
  });

  it('Must be no longer than 1,500 bytes', () => {
    const string = new Array(1502).join('a');
    expect(isValidDocumentId(string)).toBeFalsy();
  });

  it('Cannot contain a forward slash (/)', () => {
    expect(isValidDocumentId('a/a')).toBeFalsy();
  });

  it('Cannot solely consist of a single period (.) or double periods (..)', () => {
    expect(isValidDocumentId('.')).toBeFalsy();
    expect(isValidDocumentId('..')).toBeFalsy();
  });

  it('Cannot match the regular expression __.*__', () => {
    expect(isValidDocumentId('__.ab__')).toBeFalsy();
  });

  it('Will allow email addresses', () => {
    expect(isValidDocumentId('matti.meikalainen@gmail.com')).toBeTruthy();
  });
});

describe('Firestore field name validation', () => {
  it('It requised name not be empty', () => {
    expect(isValidFirestoreFieldName('')).toBeFalsy();
  });

  it('The field name contains only the characters a-z, A-Z, 0-9, and underscore (_)', () => {
    expect(isValidFirestoreFieldName('aA0_')).toBeTruthy();
    expect(isValidFirestoreFieldName('ä')).toBeFalsy();
  });

  it('The field name does not start with 0-9', () => {
    expect(isValidFirestoreFieldName('a0')).toBeTruthy();
    expect(isValidFirestoreFieldName('0ä')).toBeFalsy();
  });

  it('Maximum size of a field path is 1,500 bytes', () => {
    expect(isValidFirestoreFieldName('a0')).toBeTruthy();
    const string = new Array(1502).join('a');
    expect(isValidFirestoreFieldName(string)).toBeFalsy();
  });

  it('Will require name in backticks if rules above do not met', () => {
    expect(isValidFirestoreFieldName('`ä`')).toBeTruthy();
    expect(isValidFirestoreFieldName('ä')).toBeFalsy();
  });
});

describe('Firestore field path validation', () => {
  it('Must separate field names with a single period (.)', () => {
    expect(isValidFirestoreFieldPath('a..b')).toBeFalsy();
    expect(isValidFirestoreFieldPath('a.b')).toBeTruthy();
    expect(isValidFirestoreFieldPath('a.b.c')).toBeTruthy();
    expect(isValidFirestoreFieldPath('a.b.c..')).toBeFalsy();
  });

  it('It requised name not be empty', () => {
    expect(isValidFirestoreFieldPath('')).toBeFalsy();
  });

  it('The field name contains only the characters a-z, A-Z, 0-9, and underscore (_)', () => {
    expect(isValidFirestoreFieldPath('aA0_')).toBeTruthy();
    expect(isValidFirestoreFieldPath('ä')).toBeFalsy();
  });

  it('The field name does not start with 0-9', () => {
    expect(isValidFirestoreFieldPath('a0')).toBeTruthy();
    expect(isValidFirestoreFieldPath('0ä')).toBeFalsy();
  });

  it('Maximum size of a field path1,500 bytes', () => {
    expect(isValidFirestoreFieldPath('a0')).toBeTruthy();
    const string = new Array(1502).join('a');
    expect(isValidFirestoreFieldPath(string)).toBeFalsy();
  });

  it('Will require name in backticks if rules above do not met', () => {
    expect(isValidFirestoreFieldPath('`ä`')).toBeTruthy();
    expect(isValidFirestoreFieldPath('`ä')).toBeFalsy();
    expect(isValidFirestoreFieldPath('ä')).toBeFalsy();
  });
});

describe('Firestore document reference path validation', () => {
  it('will have a path with even count of elements', () => {
    expect(isValidDocumentReference('collection')).toBeFalsy();
    expect(isValidDocumentReference('collection/document')).toBeTruthy();
    expect(isValidDocumentReference('collection/doc/subcollection')).toBeFalsy();
    expect(
      isValidDocumentReference('collection/doc/subcollection/do')
    ).toBeTruthy();
  });
  it('the path is not empty', () => {
    expect(isValidDocumentReference('')).toBeFalsy();
  });
  it('the path will not contain double slashes ', () => {
    expect(isValidDocumentReference('//')).toBeFalsy();
    expect(isValidDocumentReference('collection//doc')).toBeFalsy();
  });
  it('will make sure that path elements are valid', () => {
    expect(isValidDocumentReference('.')).toBeFalsy();
    expect(isValidDocumentReference('..')).toBeFalsy();
    expect(
      isValidDocumentReference('collection/document\x0000error')
    ).toBeFalsy();
  });
  it('paths max length is set to 1500', () => {
    expect(isValidDocumentReference(new Array(1502).join('a'))).toBeFalsy();
  });
});

describe('Firestore collection refence path validation', () => {
  it('will have a path with odd count of elements', () => {
    expect(isValidCollectionReference('collection')).toBeTruthy();
    expect(isValidCollectionReference('collection/document')).toBeFalsy();
    expect(
      isValidCollectionReference('collection/doc/subcollection')
    ).toBeTruthy();
    expect(
      isValidCollectionReference('collection/doc/subcollection/do')
    ).toBeFalsy();
  });
  it('the path is not empty', () => {
    expect(isValidCollectionReference('')).toBeFalsy();
  });
  it('the path will not contain double slashes ', () => {
    expect(isValidCollectionReference('collection//doc')).toBeFalsy();
  });
  it('will make sure that path elements are valid', () => {
    expect(isValidCollectionReference('.')).toBeFalsy();
    expect(isValidCollectionReference('..')).toBeFalsy();
    expect(isValidCollectionReference('\x0000ats/miisu/a')).toBeFalsy();
    expect(isValidCollectionReference('cats/\x00000iisu')).toBeFalsy();
    expect(isValidCollectionReference('cats/miisu/\x00000F/sd')).toBeFalsy();
    expect(isValidCollectionReference('cats/miisu/FF/\x0000d')).toBeFalsy();
  });
  it('paths max length is set to 1500', () => {
    expect(isValidCollectionReference(new Array(1502).join('a'))).toBeFalsy();
  });
});
