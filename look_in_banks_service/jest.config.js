module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@ports/(.*)$': '<rootDir>/src/ports/$1',
      '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
      '^@domain/(.*)$': '<rootDir>/src/domain/$1',
      '^@config/(.*)$': '<rootDir>/src/config/$1',
      '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    },
    setupFilesAfterEnv: ['./jest.setup.js'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
  };