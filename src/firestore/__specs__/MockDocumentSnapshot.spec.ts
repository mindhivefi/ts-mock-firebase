import MockDocumentSnapshot from '../MockDocumentSnapshot';
import MockFieldPath from '../MockFieldPath';

describe('MockDocumentSnapshot', () => {
  describe('get', () => {
    it('Will retrieve the field value specified by the field name.', () => {
      const data = {
        text: 'value',
        text2: 'some',
      };
      const snapshot = new MockDocumentSnapshot({} as any, data);

      expect(snapshot.get('text')).toBe('value');
    });
    it('Will return undefined if the field does not exist.', () => {
      const data = {
        text: 'value',
        text2: 'some',
      };
      const snapshot = new MockDocumentSnapshot({} as any, data);

      expect(snapshot.get('text3')).toBeUndefined();
    });

    it('Will retrieve the field value specified by a FieldPath.', () => {
      const data = {
        subset: {
          text: 'value',
        },
        text2: 'some',
      };
      const snapshot = new MockDocumentSnapshot({} as any, data);

      const path = new MockFieldPath('subset', 'text');
      expect(snapshot.get(path)).toBe('value');
    });

    it('Will return undefined when specified field by a FieldPath does not exist.', () => {
      const data = {
        subset: {
          text: 'value',
        },
        text2: 'some',
      };
      const snapshot = new MockDocumentSnapshot({} as any, data);

      const path = new MockFieldPath('subset', 'cat');
      expect(snapshot.get(path)).toBeUndefined();
    });
  });
});
