export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEach: [],
  setupFiles: ['dotenv/config'],
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
};
