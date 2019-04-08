import { MockTimestamp } from '../MockTimestamp';

describe('MockTimestamp', () => {
  it('will create a timestamp from a date', () => {
    const date = new Date('2019-03-11 10:37');
    const timestamp = MockTimestamp.fromDate(date);

    const milliseconds = date.getTime();

    const seconds = Math.floor(milliseconds / 1000);
    const nanoseconds = (milliseconds - seconds * 1000) * 1000000;

    expect(timestamp.seconds).toBe(seconds);
    expect(timestamp.nanoseconds).toBe(nanoseconds);
  });

  it('will create a timestamp from now', () => {
    const date = new Date();
    const timestamp = MockTimestamp.now();

    expect(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000 - date.getTime()).toBeLessThan(200);
  });

  it('will create a timestamp from milliseconds', () => {
    const date = 5500.5;
    const timestamp = MockTimestamp.fromMillis(date);

    expect(timestamp.seconds).toBe(5);
    expect(timestamp.nanoseconds).toBe(500500000);
  });

  it('will return value back to date', () => {
    const date = new Date('2019-03-11 12:37');
    const timestamp = MockTimestamp.fromDate(date);
    expect(timestamp.toDate()).toEqual(date);
  });

  it('will return value back to milliseconds', () => {
    const date = new Date('2019-03-11 12:37');
    const timestamp = MockTimestamp.fromMillis(date.getTime());
    expect(timestamp.toMillis()).toEqual(date.getTime());
  });

  describe('Equality', () => {
    it('will match equal timestamps', () => {
      const date = new Date('2019-03-11 12:37');
      const date2 = new Date('2019-03-11 12:37');
      const timestamp = MockTimestamp.fromMillis(date.getTime());
      const timestamp2 = MockTimestamp.fromMillis(date2.getTime());
      expect(timestamp.isEqual(timestamp2)).toBe(true);
    });
    it('will unmatch different timestamps', () => {
      const date = new Date('2019-03-11 12:37');
      const date2 = new Date('2019-01-13 10:37');
      const timestamp = MockTimestamp.fromMillis(date.getTime());
      const timestamp2 = MockTimestamp.fromMillis(date2.getTime());
      expect(timestamp.isEqual(timestamp2)).toBe(false);
    });
  });
});
