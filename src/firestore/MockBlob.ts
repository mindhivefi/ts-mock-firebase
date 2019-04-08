import { Blob } from '@firebase/firestore-types';

import { Code } from './utils/error';
import { invalidClassError, validateArgType, validateExactNumberOfArgs } from './utils/input_validation';
import { primitiveComparator } from './utils/misc';
import { MockFirestoreError } from './utils/MockFirestoreError';

const atob = (encoded: string): string => {
  // Node actually doesn't validate base64 strings.
  // A quick sanity check that is not a fool-proof validation
  if (/[^-A-Za-z0-9+/=]/.test(encoded)) {
    throw new MockFirestoreError(Code.INVALID_ARGUMENT, 'Not a valid Base64 string: ' + encoded);
  }
  return new Buffer(encoded, 'base64').toString('binary');
};

const btoa = (raw: string): string => {
  return new Buffer(raw, 'binary').toString('base64');
};

/** Helper function to assert Uint8Array is available at runtime. */
function assertUint8ArrayAvailable(): void {
  if (typeof Uint8Array === 'undefined') {
    throw new MockFirestoreError(Code.UNIMPLEMENTED, 'Uint8Arrays are not available in this environment.');
  }
}

/** Helper function to assert Base64 functions are available at runtime. */
function assertBase64Available(): void {}

/**
 * An immutable object representing an array of bytes.
 */
export class MockBlob implements Blob {
  /**
   * Creates a new Blob from the given Base64 string, converting it to
   * bytes.
   */
  public static fromBase64String(base64: string): MockBlob {
    validateExactNumberOfArgs('Blob.fromBase64String', arguments, 1);
    validateArgType('Blob.fromBase64String', 'string', 1, base64);
    assertBase64Available();
    try {
      const binaryString = atob(base64);
      return new MockBlob(binaryString);
    } catch (e) {
      throw new MockFirestoreError(Code.INVALID_ARGUMENT, 'Failed to construct Blob from Base64 string: ' + e);
    }
  }
  /**
   * Creates a new Blob from the given Uint8Array.
   */
  public static fromUint8Array(array: Uint8Array): MockBlob {
    validateExactNumberOfArgs('Blob.fromUint8Array', arguments, 1);
    assertUint8ArrayAvailable();
    if (!(array instanceof Uint8Array)) {
      throw invalidClassError('MockBlob.fromUint8Array', 'Uint8Array', 1, array);
    }
    // We can't call array.map directly because it expects the return type to
    // be a Uint8Array, whereas we can convert it to a regular array by invoking
    // map on the Array prototype.
    const binaryString = Array.prototype.map
      .call(array, (char: number) => {
        return String.fromCharCode(char);
      })
      .join('');
    return new MockBlob(binaryString);
  }
  // Prefix with underscore to signal this is a private variable in JS and
  // prevent it showing up for autocompletion.
  // A binary string is a string with each char as Unicode code point in the
  // range of [0, 255], essentially simulating a byte array.
  private _binaryString: string;

  private constructor(binaryString: string) {
    assertBase64Available();
    this._binaryString = binaryString;
  }

  /**
   * Returns the bytes of this Blob as a Base64-encoded string.
   */
  public toBase64(): string {
    validateExactNumberOfArgs('Blob.toBase64', arguments, 0);
    assertBase64Available();
    return btoa(this._binaryString);
  }

  /**
   * Returns the bytes of this Blob in a new Uint8Array.
   */
  public toUint8Array(): Uint8Array {
    validateExactNumberOfArgs('Blob.toUint8Array', MockBlob.arguments, 0);
    assertUint8ArrayAvailable();
    const buffer = new Uint8Array(this._binaryString.length);
    for (let i = 0; i < this._binaryString.length; i++) {
      buffer[i] = this._binaryString.charCodeAt(i);
    }
    return buffer;
  }

  /**
   * Returns true if this `Blob` is equal to the provided one.
   *
   * @param other The `Blob` to compare against.
   * @return true if this `Blob` is equal to the provided one.
   */
  public isEqual(other: MockBlob): boolean {
    return this._binaryString === other._binaryString;
  }

  public toString(): string {
    return 'MockBlob(base64: ' + this.toBase64() + ')';
  }

  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  public _compareTo(other: MockBlob): number {
    return primitiveComparator(this._binaryString, other._binaryString);
  }
}
