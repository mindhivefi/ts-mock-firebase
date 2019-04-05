import { MockGeoPoint } from '../MockGeoPoint';

describe('GeoPoint', () => {
  it('will create an GeoPoint instance', () => {
    const geo = new MockGeoPoint(1, 2);

    expect(geo.latitude).toBe(1);
    expect(geo.longitude).toBe(2);
  });

  it('will match two GeoPoint instances', () => {
    const geo = new MockGeoPoint(1, 2);
    expect(geo.isEqual(new MockGeoPoint(1, 2))).toBe(true);
  });

  it('will unmatch two different GeoPoint instances', () => {
    const geo = new MockGeoPoint(1, 2);
    expect(geo.isEqual(new MockGeoPoint(1, 3))).toBe(false);
  });
});
