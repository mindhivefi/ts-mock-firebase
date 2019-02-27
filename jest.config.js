const { pathsToModuleNameMapper } = require('ts-jest/utils');

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['lib', 'node_modules', 'tools'],
  testRegex: '(/__specs__/.*|(\\.|/)(spec))\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // map the baseDir for tests
  modulePaths: ['<rootDir>/src/'],
  verbose: true,
};
