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
});
