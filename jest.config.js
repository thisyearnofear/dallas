export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/api'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts', '**/api/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'ESNext',
        moduleResolution: 'bundler',
      },
    }],
  },
  // Treat Vite-style env vars as regular modules so import.meta.env works in tests
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
  },
  // Provide import.meta.env shim via a setup file
  setupFiles: ['<rootDir>/jest.setup.shim.js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'api/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
};
