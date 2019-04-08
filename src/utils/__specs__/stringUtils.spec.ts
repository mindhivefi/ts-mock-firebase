import { hash } from '../stringUtils';

describe('String Utils', () => {
  it('will create a same has every time for a same string', () => {
    const source = 'This is a test input.';
    const value = hash(source);
    expect(value === hash(source)).toBe(true);
  });
  it('will allow an empty string string as an input and it will give for that a has value of zero', () => {
    const source = '';
    expect(hash(source)).toBe(0);
  });
});
