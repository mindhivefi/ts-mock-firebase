import { FirestoreMock } from 'firestore';
import { CollectionReferenceMock } from 'firestore/CollectionReferenceMock';
import DocumentReferenceMock from 'firestore/DocumentReferenceMock';
import * as uuidv4 from 'uuid/v4';

export class NotImplementedYet extends Error {
  constructor() {
    super('Not implmeneted yet');
  }
}

/**
 * Generate an unique document id
 */
export function generateDocumentId(): string {
  const id = uuidv4();
  let result = '';
  for (const c of id) {
    if (isValidUnicodeCharacter(c)) {
      result += c;
    }
  }
  return result;
}

/**
 * Validates document
 * Must be valid UTF-8 characters
 * Must be no longer than 1,500 bytes
 * Cannot contain a forward slash (/)
 * Cannot solely consist of a single period (.) or double periods (..)
 * Cannot match the regular expression __.*__
 *
 * @param path Constraints on document IDs
 */
export function isValidDocumentId(id: string): boolean {
  if (id === '' || id === '.' || id === '..' || id.length > 1500) {
    return false;
  }
  return isValidUnicodeString(id);
}

/**
 * Validate Firestore document path reference string
 * @param path
 */
export function isValidDocumentReference(path: string): boolean {
  return isValidPathReference(path, 1);
}

/**
 * Validate Firestore document path reference string
 * @param path
 */
export function isValidCollectionReference(path: string): boolean {
  return isValidPathReference(path, 0);
}

/**
 * Validate a firestore path for document or collection. This function is used only internally
 * in this module to avoid repetative code.
 *
 * @param path Path to be parsed
 * @param parity 0 for collection and 1 for document
 */
function isValidPathReference(path: string, parity: 0 | 1): boolean {
  if (path === '' || path.indexOf('//') >= 0 || path.length > 1500) {
    return false;
  }
  const items = path.split('/');

  if ((items.length & 1) === parity) {
    return false;
  }
  for (const item of items) {
    if (!isValidDocumentId(item)) {
      return false;
    }
  }
  return true;
}

const FIRESTORE_FIELD_PATH_VALID_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
const FIRESTORE_FIELD_NAME_VALID_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.';
const NUMBERS = '0123456789';

/**
 * Validated if field fulfills requirements set to Firestore field names:
 *
 * Must enclose each field name in backticks unless the field name meets the following requirements:
 * - The field name contains only the characters a-z, A-Z, 0-9, and underscore (_)
 * - The field name does not start with 0-9
 *
 * Maximum size of a field name is 1,500 bytes
 *
 * @see https://firebase.google.com/docs/firestore/quotas#limits
 * @param name
 */
export function isValidFirestoreFieldName(name: string): boolean {
  if (name === '' || NUMBERS.indexOf(name[0]) >= 0 || name.length > 1500) {
    return false;
  }

  if (name[0] === '`') {
    return validateBacktickedField(name);
  }
  for (const c of name) {
    if (FIRESTORE_FIELD_PATH_VALID_CHARACTERS.indexOf(c) < 0) {
      return false;
    }
  }
  return true;
}

/**
 * Validated if field fulfills requirements set to Firestore field name paths:
 *
 * Constraints on field paths:
 * - Must separate field names with a single period (.)
 *
 * Must enclose each field name in backticks unless the field name meets the following requirements:
 * - The field name contains only the characters a-z, A-Z, 0-9, and underscore (_)
 * - The field name does not start with 0-9
 *
 * Maximum size of a field path	is 1,500 bytes
 *
 * @see https://firebase.google.com/docs/firestore/quotas#limits
 * @param name
 */
export function isValidFirestoreFieldPath(name: string): boolean {
  if (name === '' || name.indexOf('..') >= 0 || NUMBERS.indexOf(name[0]) >= 0 || name.length > 1500) {
    return false;
  }
  if (name[0] === '`') {
    return validateBacktickedField(name);
  }
  for (const c of name) {
    if (FIRESTORE_FIELD_NAME_VALID_CHARACTERS.indexOf(c) < 0) {
      return false;
    }
  }
  return true;
}

function validateBacktickedField(name: string): boolean {
  if (name[name.length - 1] !== '`') {
    return false;
  }
  for (let i = 1; i < name.length - 2; i++) {
    if (!isValidUnicodeCharacter(name[i])) {
      return false;
    }
  }
  return true;
}
// ^[a-zA-Z0-9!\b]{1,}$
// u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\.!#$%&'*+-/=?^_`{|}~\-\d]+){2,63})+)$/i;
// const unicodeRegEx = /^[a-zA-Z0-9u0080-u00FFu0100-u017Fu0180-u024Fu0250-u02AFu0300-u036Fu0370-u03FFu0400-u04FFu0500-u052Fu0530-u058Fu0590-u05FFu0600-u06FFu0700-u074Fu0750-u077Fu0780-u07BFu07C0-u07FFu0900-u097Fu0980-u09FFu0A00-u0A7Fu0A80-u0AFFu0B00-u0B7Fu0B80-u0BFFu0C00-u0C7Fu0C80-u0CFFu0D00-u0D7Fu0D80-u0DFFu0E00-u0E7Fu0E80-u0EFFu0F00-u0FFFu1000-u109Fu10A0-u10FFu1100-u11FFu1200-u137Fu1380-u139Fu13A0-u13FFu1400-u167Fu1680-u169Fu16A0-u16FFu1700-u171Fu1720-u173Fu1740-u175Fu1760-u177Fu1780-u17FFu1800-u18AFu1900-u194Fu1950-u197Fu1980-u19DFu19E0-u19FFu1A00-u1A1Fu1B00-u1B7Fu1D00-u1D7Fu1D80-u1DBFu1DC0-u1DFFu1E00-u1EFFu1F00-u1FFFu20D0-u20FFu2100-u214Fu2C00-u2C5Fu2C60-u2C7Fu2C80-u2CFFu2D00-u2D2Fu2D30-u2D7Fu2D80-u2DDFu2F00-u2FDFu2FF0-u2FFFu3040-u309Fu30A0-u30FFu3100-u312Fu3130-u318Fu3190-u319Fu31C0-u31EFu31F0-u31FFu3200-u32FFu3300-u33FFu3400-u4DBFu4DC0-u4DFFu4E00-u9FFFuA000-uA48FuA490-uA4CFuA700-uA71FuA800-uA82FuA840-uA87FuAC00-uD7AFuF900-uFAFF\._!\b]{1,}$/i;

// TODO the whole range of unicode characters
const unicodeRegEx = /[u2010-u2015a-zA-Z0-9\u0040-\u007f\u0080-\u02AF\u0300-\u07FF\u0900-\u18AF\u1900-\u1A1F\u1B00-\u1B7F\u1D00-\u1FFFu20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]{1,}/u;

export function isValidUnicodeCharacter(c: string): boolean {
  return unicodeRegEx.test(c);
}

function isValidUnicodeString(s: string): boolean {
  for (const c of s) {
    if (!isValidUnicodeCharacter(c)) {
      return false;
    }
  }
  return true;
}

export function resolveReference(
  firestore: FirestoreMock,
  root: DocumentReferenceMock | null,
  isCollectionPath: boolean,
  path: string,
  startParity: boolean = true,
  rootCollection?: CollectionReferenceMock,
): CollectionReferenceMock | DocumentReferenceMock {
  let testPath = path;
  if (!startParity) {
    /* if there is no start parity, it means that that path seeking is starting from a document level.
     * We verity the validity by adding a mock collection to start of path.
     */
    testPath = 'collection/' + path;
  }
  if (!(isCollectionPath ? isValidCollectionReference(testPath) : isValidDocumentReference(testPath))) {
    throw Error(`Not a valid ${isCollectionPath ? 'collection' : 'document'} reference: ${path}`);
  }

  const elements = path.split('/');
  let doc = root || firestore.root;
  let collection = rootCollection || (doc.parent as CollectionReferenceMock);

  let parity = startParity;

  for (const id of elements) {
    if (parity) {
      collection = doc.mocker.collection(id);
      if (!collection) {
        collection = new CollectionReferenceMock(firestore, id, doc !== firestore.root ? doc : null);
        doc.mocker.setCollection(collection);
      }
    } else {
      if (collection) {
        doc = collection.mocker.doc(id);
        if (!doc) {
          doc = new DocumentReferenceMock(firestore, id, collection);
          collection.mocker.setDoc(doc);
        }
      }
    }
    parity = !parity;
  }
  if (!collection) {
    throw new Error('Collection path parsing failed. No collection found.');
  }

  return isCollectionPath ? collection : doc;
}
