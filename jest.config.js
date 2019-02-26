const { pathsToModuleNameMapper } = require('ts-jest/utils');

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // mat the baseDir
  testPathIgnorePatterns: ['lib', 'node_modules', 'tools'],
  testRegex: '(/__specs__/.*|(\\.|/)(spec))\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>../@shared/$1',
    // ...generateJestModuleMappings(__dirname),
  },
  modulePaths: ['<rootDir>'],
  verbose: true,
};
