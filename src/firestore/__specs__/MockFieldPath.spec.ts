import { createFieldPathFromString, documentIdSentinel, MockFieldPath } from '../MockFieldPath';

describe('Field Paths', () => {
  describe('MockFieldPath', () => {
    it('will return a simple path', () => {
      const fieldPath = new MockFieldPath('cool');
      expect(fieldPath.path).toMatch('cool');
    });
    it('will return a path to sub field', () => {
      const fieldPath = new MockFieldPath('cool', 'beer', 'tempts', 'me');
      expect(fieldPath.path).toMatch('cool.beer.tempts.me');
    });
    it('will identify equal paths', () => {
      const firstPint = new MockFieldPath('cool', 'beer');
      const secondPint = new MockFieldPath('cool', 'beer');
      expect(firstPint.isEqual(secondPint)).toBeTruthy();
    });
    it('will identify inequal paths', () => {
      const firstPint = new MockFieldPath('cool', 'beer');
      const notSoGood = new MockFieldPath('warm', 'cider');
      expect(firstPint.isEqual(notSoGood)).toBeFalsy();
    });

    it('will return document id sentinel', () => {
      expect(MockFieldPath.documentId).toBe(documentIdSentinel);
    });
  });

  describe('createFieldPathFromString', () => {
    it('will transform string presentation to object', () => {
      const path = createFieldPathFromString('test.me.well');

      expect(path.fieldNames).toEqual(['test', 'me', 'well']);
    });
  });
});
