module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/cdk.out/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: {
        ignoreCodes: [151002]
      }
    }]
  },
  verbose: true
};