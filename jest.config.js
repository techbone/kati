/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-purchases.*))',
  ],
  collectCoverageFrom: ['src/domain/**/*.ts', '!src/domain/**/__tests__/**'],
  coverageThreshold: {
    // The schedule engine is the one place a bug is a real-world harm.
    'src/domain/': { branches: 80, functions: 90, lines: 90, statements: 90 },
  },
};
