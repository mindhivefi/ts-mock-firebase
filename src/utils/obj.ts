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

// See http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/

export const contains = function(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export const safeGet = function(obj: any, key: string) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key];
  }
  // else return undefined.
};

/**
 * Enumerates the keys/values in an object, excluding keys defined on the prototype.
 *
 * @param {?Object.<K,V>} obj Object to enumerate.
 * @param {!function(K, V)} fn Function to call for each key and value.
 * @template K,V
 */
export const forEach = function(obj: any, fn: (key: string, value: any) => void) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
};

/**
 * Copies all the (own) properties from one object to another.
 * @param {!Object} objTo
 * @param {!Object} objFrom
 * @return {!Object} objTo
 */
export const extend = function(objTo: any, objFrom: any) {
  forEach(objFrom, (key, value) => {
    objTo[key] = value;
  });
  return objTo;
};

/**
 * Returns a clone of the specified object.
 * @param {!Object} obj
 * @return {!Object} cloned obj.
 */
export const clone = function(obj: any) {
  return extend({}, obj);
};

/**
 * Returns true if obj has typeof "object" and is not null.  Unlike goog.isObject(), does not return true
 * for functions.
 *
 * @param obj {*} A potential object.
 * @returns {boolean} True if it's an object.
 */
export const isNonNullObject = function(obj: any) {
  return typeof obj === 'object' && obj !== null;
};

export const isEmpty = (obj: any): boolean => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export const getCount = (obj: any): number => {
  let rv = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      rv++;
    }
  }
  return rv;
};

export const map = function(obj: any, f: any, opt_obj?: any) {
  const res: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      res[key] = f.call(opt_obj, obj[key], key, obj);
    }
  }
  return res;
};

export const findKey = function(obj: any, fn: any, opt_this?: any) {
  for (const key in obj) {
    if (fn.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};

export const findValue = function(obj: any, fn: any, opt_this?: any) {
  const key = findKey(obj, fn, opt_this);
  return key && obj[key];
};

export const getAnyKey = function(obj: any) {
  for (const key in obj) {
    return key;
  }
};

export const getValues = function(obj: any) {
  const res = [];
  let i = 0;
  for (const key in obj) {
    res[i++] = obj[key];
  }
  return res;
};

/**
 * Tests whether every key/value pair in an object pass the test implemented
 * by the provided function
 *
 * @param {?Object.<K,V>} obj Object to test.
 * @param {!function(K, V)} fn Function to call for each key and value.
 * @template K,V
 */
export const every = function<V>(obj: any, fn: (k: string, v?: V) => boolean): boolean {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (!fn(key, obj[key])) {
        return false;
      }
    }
  }
  return true;
};
