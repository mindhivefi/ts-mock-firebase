import { Timestamp } from '@firebase/firestore-types';

export default class MockTimestamp implements Timestamp {
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @return a new timestamp representing the current date.
   */
  public static now(): MockTimestamp {
    return MockTimestamp.fromDate(new Date());
  }

  /**
   * Creates a new timestamp from the given date.
   *
   * @param date The date to initialize the `Timestamp` from.
   * @return A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  public static fromDate(date: Date): MockTimestamp {
    return MockTimestamp.fromMillis(date.getTime());
  }

  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @return A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  public static fromMillis(milliseconds: number): MockTimestamp {
    const seconds = Math.floor(milliseconds / 1000);
    const nanoseconds = (milliseconds - seconds * 1000) * 1000000;
    return new MockTimestamp(seconds, nanoseconds);
  }

  private _seconds: number;
  private _nanoseconds: number;

  /**
   * Creates a new timestamp.
   *
   * @param seconds The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(seconds: number, nanoseconds: number) {
    this._seconds = seconds;
    this._nanoseconds = nanoseconds;
  }

  public get seconds(): number {
    return this._seconds;
  }

  public get nanoseconds(): number {
    return this._nanoseconds;
  }

  /**
   * Returns a new `Date` corresponding to this timestamp. This may lose
   * precision.
   *
   * @return JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  public toDate(): Date {
    return new Date(this.toMillis());
  }

  /**
   * Returns the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   *
   * @return The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  public toMillis(): number {
    return this._seconds * 1000 + this._nanoseconds / 1000000;
  }

  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other The `Timestamp` to compare against.
   * @return true if this `Timestamp` is equal to the provided one.
   */
  public isEqual(other: Timestamp): boolean {
    return (
      other.seconds === this._seconds && other.nanoseconds === this._nanoseconds
    );
  }
}
