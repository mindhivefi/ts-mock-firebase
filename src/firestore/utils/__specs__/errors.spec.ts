import { MockFirestoreError } from '../MockFirestoreError';
import { NotImplementedYet } from '../NotImplementedYet';

describe('Errors', () => {
  describe('MockFirestoreError', () => {
    it('will create an error with given error code and message', () => {
      const error = new MockFirestoreError('internal', 'test');
      expect(error.code).toBe('internal');
      expect(error.message).toBe('test');
    });
  });

  describe('NotImplementedYet', () => {
    it('will create an error with message including given label', () => {
      const error = new NotImplementedYet('jest');
      expect(error.message).toMatch('jest');
    });
    it('will create an error with message including "Not implemented yet" -text', () => {
      const error = new NotImplementedYet('jest');
      expect(error.message).toMatch('Not implemented yet');
    });
    it('will not require label to used', () => {
      const error = new NotImplementedYet();
      expect(error.message).toMatch('Not implemented yet');
    });
  });
});
