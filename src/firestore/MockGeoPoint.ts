import { GeoPoint } from "@firebase/firestore-types";

/**
 * An immutable object representing a geo point in Firestore. The geo point
 * is represented as latitude/longitude pair.
 *
 * Latitude values are in the range of [-90, 90].
 * Longitude values are in the range of [-180, 180].
 */
export class MockGeoPoint implements GeoPoint {
  /**
   * Creates a new immutable GeoPoint object with the provided latitude and
   * longitude values.
   * @param latitude The latitude as number between -90 and 90.
   * @param longitude The longitude as number between -180 and 180.
   */
  constructor(public readonly latitude: number, public readonly longitude: number) {}

  // readonly latitude: number;
  // readonly longitude: number;

  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other The `GeoPoint` to compare against.
   * @return true if this `GeoPoint` is equal to the provided one.
   */
  public isEqual = (other: GeoPoint): boolean => {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }
}