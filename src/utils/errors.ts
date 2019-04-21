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
/**
 * @fileoverview Standardized Firebase Error.
 *
 * Usage:
 *
 *   // Typescript string literals for type-safe codes
 *   type Err =
 *     'unknown' |
 *     'object-not-found'
 *     ;
 *
 *   // Closure enum for type-safe error codes
 *   // at-enum {string}
 *   var Err = {
 *     UNKNOWN: 'unknown',
 *     OBJECT_NOT_FOUND: 'object-not-found',
 *   }
 *
 *   let errors: Map<Err, string> = {
 *     'generic-error': "Unknown error",
 *     'file-not-found': "Could not find file: {$file}",
 *   };
 *
 *   // Type-safe function - must pass a valid error code as param.
 *   let error = new ErrorFactory<Err>('service', 'Service', errors);
 *
 *   ...
 *   throw error.create(Err.GENERIC);
 *   ...
 *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
 *   ...
 *   // Service: Could not file file: foo.txt (service/file-not-found).
 *
 *   catch (e) {
 *     assert(e.message === "Could not find file: foo.txt.");
 *     if (e.code === 'service/file-not-found') {
 *       console.log("Could not read file: " + e['file']);
 *     }
 *   }
 */
export interface ErrorList<T> {
  [code: string]: string;
}

const ERROR_NAME = 'FirebaseError';

export interface StringLike {
  toString: () => string;
}

let captureStackTrace: (obj: Object, fn?: Function) => void = (Error as any).captureStackTrace;

// Export for faking in tests
export function patchCapture(captureFake?: any): any {
  const result: any = captureStackTrace;
  captureStackTrace = captureFake;
  return result;
}

export interface MockFirebaseError {
  // Unique code for error - format is service/error-code-string
  code: string;

  // Developer-friendly error message.
  message: string;

  // Always 'FirebaseError'
  name: string;

  // Where available - stack backtrace in a string
  stack: string;
}

export class MockFirebaseError extends Error implements MockFirebaseError {
  public stack: string = '';
  public name: string = '';

  constructor(public code: string, public message: string) {
    super(message);
    // We want the stack value, if implemented by Error
    if (captureStackTrace) {
      // Patches this.stack, omitted calls above ErrorFactory#create
      captureStackTrace(this, MockErrorFactory.prototype.create);
    }
  }
}

// Back-door inheritance
MockFirebaseError.prototype = Object.create(Error.prototype) as MockFirebaseError;
MockFirebaseError.prototype.constructor = MockFirebaseError;
(MockFirebaseError.prototype as any).name = ERROR_NAME;

// tslint:disable-next-line: max-classes-per-file
export class MockErrorFactory<T extends string> {
  // Matches {$name}, by default.
  public pattern = /\{\$([^}]+)}/g;

  constructor(private service: string, private serviceName: string, private errors: ErrorList<T>) {
    // empty
  }

  public create(code: T, data?: { [prop: string]: StringLike }): MockFirebaseError {
    if (data === undefined) {
      data = {};
    }

    const template = this.errors[code as string];

    const fullCode = this.service + '/' + code;
    let message: string;

    if (template === undefined) {
      message = 'Error';
    } else {
      message = template.replace(this.pattern, (match, key) => {
        const value = data![key];
        return value !== undefined ? value.toString() : '<' + key + '?>';
      });
    }

    // Service: Error message (service/code).
    message = this.serviceName + ': ' + message + ' (' + fullCode + ').';
    const err = new MockFirebaseError(fullCode, message);

    // Populate the Error object with message parts for programmatic
    // accesses (e.g., e.file).
    for (const prop in data) {
      if (!data.hasOwnProperty(prop) || prop.slice(-1) === '_') {
        continue;
      }
      (err as any)[prop] = data[prop];
    }

    return err;
  }
}
