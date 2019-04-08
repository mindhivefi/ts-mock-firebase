/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as util from 'util';
import { fail } from '../utils/assert';
import { Code } from '../utils/error';
import { MockFirestoreError } from '../utils/MockFirestoreError';
/**
 * Provides a common interface to load anything platform dependent, e.g.
 * the connection implementation.
 *
 * An implementation of this must be provided at compile time for the platform.
 */
// TODO: Consider only exposing the APIs of 'document' and 'window' that we
// use in our client.
export interface Platform {
  /** The Platform's 'window' implementation or null if not available. */
  readonly window: Window | null;

  /** The Platform's 'document' implementation or null if not available. */
  readonly document: Document | null;

  /** True if and only if the Base64 conversion functions are available. */
  readonly base64Available: boolean;

  readonly emptyByteString: any; // TODO support if needed

  /** Formats an object as a JSON string, suitable for logging. */
  formatJSON(value: unknown): string;

  /** Converts a Base64 encoded string to a binary string. */
  atob(encoded: string): string;

  /** Converts a binary string to a Base64 encoded string. */
  btoa(raw: string): string;
}

/**
 * Provides singleton helpers where setup code can inject a platform at runtime.
 * setPlatform needs to be set before Firestore is used and must be set exactly
 * once.
 */
export class PlatformSupport {
  public static setPlatform(platform: Platform): void {
    if (PlatformSupport.platform) {
      fail('Platform already defined');
    }
    PlatformSupport.platform = platform;
  }

  public static getPlatform(): Platform {
    if (!PlatformSupport.platform) {
      fail('Platform not set');
    }
    return PlatformSupport.platform;
  }
  private static platform: Platform;
}

// tslint:disable-next-line: max-classes-per-file
export class NodePlatform implements Platform {
  public readonly base64Available = true;

  public readonly emptyByteString = new Uint8Array(0);

  public readonly document = null;

  get window(): Window | null {
    if (process.env.USE_MOCK_PERSISTENCE === 'YES') {
      return window;
    }

    return null;
  }

  public formatJSON(value: unknown): string {
    // util.inspect() results in much more readable output than JSON.stringify()
    return util.inspect(value, { depth: 100 });
  }

  public atob(encoded: string): string {
    // Node actually doesn't validate base64 strings.
    // A quick sanity check that is not a fool-proof validation
    if (/[^-A-Za-z0-9+/=]/.test(encoded)) {
      throw new MockFirestoreError(Code.INVALID_ARGUMENT, 'Not a valid Base64 string: ' + encoded);
    }
    return new Buffer(encoded, 'base64').toString('binary');
  }

  public btoa(raw: string): string {
    return new Buffer(raw, 'binary').toString('base64');
  }
}

PlatformSupport.setPlatform(new NodePlatform());
