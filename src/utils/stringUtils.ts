/**
 * Calculate an hash number for a given string
 *
 * @export
 * @param {string} source
 * @returns {number}
 */
export function hash(source: string): number {
  let value: number = 0;
  for (const char of source) {
    // tslint:disable-next-line: no-bitwise
    value |= (value << 5) - value + parseInt(char, 0);
  }
  return value;
}