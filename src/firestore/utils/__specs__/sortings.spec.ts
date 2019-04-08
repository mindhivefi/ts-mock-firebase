import { MockFieldPath } from '../../MockFieldPath';
import { MockGeoPoint } from '../../MockGeoPoint';
import { MockTimestamp } from '../../MockTimestamp';
import { querySortFunction } from '../sortings';

describe('Simple field sorting', () => {
  describe('Number fields', () => {
    const data = [
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
    it('will sort number fields in ascending order with default direction', () => {
      const fun = querySortFunction('a');
      const result = sortData(data, fun);
      expect(result[0].data.a).toBe(1);
    });
    it('will sort number fields in ascending order when direction is explicitly set', () => {
      const fun = querySortFunction('a', 'asc');
      const result = sortData(data, fun);
      expect(result[0].data.a).toBe(1);
    });

    it('will sort number fields in descending order when direction is explicitly set', () => {
      const fun = querySortFunction('a', 'desc');
      const result = sortData(data, fun);
      expect(result[0].data.a).toBe(3);
    });
  });

  describe('String fields', () => {
    const data = [{ data: { a: 'Horse' } }, { data: { a: 'Dog' } }, { data: { a: 'Cat' } }];
    it('will sort string fields in ascending order with default direction', () => {
      const fun = querySortFunction('a');
      const result = sortData(data, fun);
      expect(result[0].data.a).toBe('Cat');
    });
    it('will sort string fields in ascending order when direction is explicitly set', () => {
      const fun = querySortFunction('a', 'asc');
      const result = sortData(data, fun);
      expect(result[0].data.a).toBe('Cat');
    });
    it('will sort string fields in descending order when direction is explicitly set', () => {
      const result = sortData(data, querySortFunction('a', 'desc'));
      expect(result[0].data.a).toBe('Horse');
    });
  });

  describe('Map fields', () => {
    const data = [
      {
        data: {
          A: { c: 'aaa' },
        },
      },
      {
        data: {
          A: { b: 'aaa', c: 'baz' },
        },
      },
      {
        data: {
          A: { a: 'foo', b: 'baz' },
        },
      },
      { data: { A: { a: 'foo', b: 'bar', c: 'qux' } } },
      { data: { A: { a: 'foo', b: 'bar' } } },
      { data: { A: { a: 'aaa', b: 'baz' } } },
    ];
    it('will sort object fields in ascending order with default direction', () => {
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.A.a).toBe('aaa');
      expect(result[0].data.A.b).toBe('baz');
      expect(result[5].data.A.c).toBe('aaa');
    });

    it('will sort object fields in ascending descending direction', () => {
      const fun = querySortFunction('A', 'desc');
      const result = sortData(data, fun);
      expect(result[5].data.A.a).toBe('aaa');
      expect(result[5].data.A.b).toBe('baz');
      expect(result[0].data.A.c).toBe('aaa');
    });
  });

  describe('Boolean fields', () => {
    const data = [
      {
        data: {
          A: true,
          B: 'first',
        },
      },
      {
        data: {
          A: false,
          B: 'second',
        },
      },
      {
        data: {
          A: false,
          B: 'third',
        },
      },
    ];
    it('will sort boolean fields in ascending order with default direction', () => {
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.A).toBe(false);
      expect(result[0].data.B).toBe('second');
      expect(result[1].data.A).toBe(false);
      expect(result[1].data.B).toBe('third');
      expect(result[2].data.A).toBe(true);
      expect(result[2].data.B).toBe('first');
    });

    it('will sort boolean fields in descending order ', () => {
      const fun = querySortFunction('A', 'desc');
      const result = sortData(data, fun);
      expect(result[0].data.A).toBe(true);
      expect(result[0].data.B).toBe('first');
      expect(result[1].data.A).toBe(false);
      expect(result[1].data.B).toBe('second');
      expect(result[2].data.A).toBe(false);
      expect(result[2].data.B).toBe('third');
    });
  });

  // TODO tests for sorting values with different data types
  describe('Compare between different data types', () => {
    it('will sort array fields in ascending order with default direction', () => {
      const data = [
        {
          data: {
            A: {
              animal: 'cat',
            },
            order: 8,
          },
        },
        {
          data: {
            A: [5, 6, 7],
            order: 7,
          },
        },
        {
          data: {
            A: new MockGeoPoint(1, 2),
            order: 6,
          },
        },

        {
          data: {
            A: 'Cat',
            order: 5,
          },
        },

        {
          data: {
            A: MockTimestamp.fromMillis(100000),
            order: 4,
          },
        },
        // TODO Blob and reference
        {
          data: {
            A: 3,
            order: 3,
          },
        },

        {
          data: {
            A: true,
            order: 2,
          },
        },

        {
          data: {
            A: null,
            order: 1,
          },
        },
      ];
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.order).toEqual(1);
      expect(result[1].data.order).toEqual(2);
      expect(result[2].data.order).toEqual(3);
      expect(result[3].data.order).toEqual(4);
      expect(result[4].data.order).toEqual(5);
      expect(result[5].data.order).toEqual(6);
      expect(result[6].data.order).toEqual(7);
      expect(result[7].data.order).toEqual(8);
    });
  });
  describe('Array fields', () => {
    it('will sort array fields in ascending order with default direction', () => {
      const data = [
        {
          data: {
            A: [1, 2, 3, 1],
          },
        },
        {
          data: {
            A: [1, 2, 3],
          },
        },
      ];
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.A).toEqual([1, 2, 3]);
      expect(result[1].data.A).toEqual([1, 2, 3, 1]);
    });

    it('will sort array fields in ascending order with default direction', () => {
      const data = [
        {
          data: {
            A: [2, 2, 3, 1],
          },
        },
        {
          data: {
            A: [1, 2, 3],
          },
        },
      ];
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.A).toEqual([1, 2, 3]);
      expect(result[1].data.A).toEqual([2, 2, 3, 1]);
    });
    it('will sort array fields in descending order', () => {
      const data = [
        {
          data: {
            A: [1, 2, 3],
          },
        },
        {
          data: {
            A: [2, 2, 3, 1],
          },
        },
      ];
      const fun = querySortFunction('A', 'desc');
      const result = sortData(data, fun);
      expect(result[0].data.A).toEqual([2, 2, 3, 1]);
      expect(result[1].data.A).toEqual([1, 2, 3]);
    });
  });

  describe('Timestamp and Date fields', () => {
    it('will sort timestamp fields in ascending order with default direction', () => {
      const data = [
        {
          data: {
            A: MockTimestamp.fromDate(new Date('2019-04-07 12:00')),
            B: 'later',
          },
        },
        {
          data: {
            A: MockTimestamp.fromDate(new Date('2019-01-01 09:00')),
            B: 'before',
          },
        },
      ];
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.B).toBe('before');
      expect(result[1].data.B).toBe('later');
    });
    it('will sort Date fields in ascending order with default direction', () => {
      const data = [
        {
          data: {
            A: new Date('2019-04-07 12:00'),
            B: 'later',
          },
        },
        {
          data: {
            A: new Date('2019-01-01 09:00'),
            B: 'before',
          },
        },
      ];
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.B).toBe('before');
      expect(result[1].data.B).toBe('later');
    });
  });

  describe('GetPoints', () => {
    it('will sort GeoPoint fields in ascending order with default direction', () => {
      const data = [
        {
          data: {
            A: new MockGeoPoint(3, 1),
            B: 'third',
          },
        },
        {
          data: {
            A: new MockGeoPoint(2, 1),
            B: 'second',
          },
        },
        {
          data: {
            A: new MockGeoPoint(2, -0),
            B: 'first',
          },
        },
      ];
      const fun = querySortFunction('A');
      const result = sortData(data, fun);
      expect(result[0].data.B).toBe('first');
      expect(result[1].data.B).toBe('second');
      expect(result[2].data.B).toBe('third');
    });
  });

  describe('Sort document ids', () => {
    it('will sort document ids in alphabetical order', () => {
      const data = [
        {
          id: 'c',
          data: {
            A: new MockGeoPoint(3, 1),
            B: 'third',
          },
        },
        {
          id: 'b',
          data: {
            A: new MockGeoPoint(2, 1),
            B: 'second',
          },
        },
        {
          id: 'a',
          data: {
            A: new MockGeoPoint(2, -0),
            B: 'first',
          },
        },
      ];
      const fun = querySortFunction(MockFieldPath.documentId);
      const result = sortData(data, fun);
      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('b');
      expect(result[2].id).toBe('c');
    });
  });
});
function sortData(data: any[], fun: import('../sortings').SortFunction) {
  return data.sort(fun);
}
