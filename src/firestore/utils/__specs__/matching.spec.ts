import { MockFirebaseApp } from '../../../firebaseApp';
import { MockDatabase } from '../../index';
import MockDocumentReference from '../../MockDocumentReference';
import MockFieldPath from '../../MockFieldPath';
import { matchFields } from '../index';
import { filterDocumentsByRules } from '../matching';

describe('Where Clauses', () => {
  describe('simple rules', () => {
    it('will filter documents by exact field match', () => {
      const docs = [
        {
          data: { a: 3 },
        },
        {
          data: { a: 2 },
        },
        {
          data: { a: 1 },
        },
      ];
      const query = filterDocumentsByRules(docs as any, [
        {
          fieldPath: 'a',
          opStr: '==',
          value: 2,
        },
      ]);

      expect(query.length).toBe(1);
    });
  });

  describe('combination rules', () => {
    it('will filter documents by exact field match with two rules', () => {
      const docs = [
        {
          data: { a: 2, b: 5 },
        },
        {
          data: {
            a: 2,
            b: 3,
          },
        },
        {
          data: { a: 1 },
        },
      ];
      const query = filterDocumentsByRules(docs as any, [
        {
          fieldPath: 'a',
          opStr: '==',
          value: 2,
        },
        {
          fieldPath: 'b',
          opStr: '>=',
          value: 3,
        },
      ]);
      expect(query.length).toBe(2);
    });
  });

  describe('Field matching', () => {
    const database: MockDatabase = {
      list: {
        docs: {
          a: {
            data: {
              field1: 'cat',
              sub: {
                field: 'dog',
              },
              field2: 'cow',
            },
          },
        },
      },
    };
    it('will find a simple field name - value match', () => {
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);
      const doc = firestore.doc('list/a') as MockDocumentReference;
      expect(matchFields(doc, ['field1'], ['cat'])).toBeTruthy();
    });
    it('will return false if the field do not exist', () => {
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);
      const doc = firestore.doc('list/a') as MockDocumentReference;
      expect(matchFields(doc, ['field3'], ['cat'])).toBeFalsy();
      expect(
        matchFields(doc, [new MockFieldPath('field5', 'daa', 'daa')], ['cat'])
      ).toBeFalsy();
    });
    it('will match values in sub objects pointed with FieldPath', () => {
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);
      const doc = firestore.doc('list/a') as MockDocumentReference;
      expect(
        matchFields(doc, [new MockFieldPath('sub', 'field')], ['dog'])
      ).toBeTruthy();
    });
    it('will un match values in sub objects pointed with FieldPath that contain wrong value', () => {
      const firestore = new MockFirebaseApp().firestore();
      firestore.mocker.fromMockDatabase(database);
      const doc = firestore.doc('list/a') as MockDocumentReference;
      expect(
        matchFields(doc, [new MockFieldPath('sub', 'field')], ['chicken'])
      ).toBeFalsy();
    });
  });
});
