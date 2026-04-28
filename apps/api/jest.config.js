/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@bookshelf/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testTimeout: 10000,
};
