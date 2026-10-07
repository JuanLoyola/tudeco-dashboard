const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** next/jest se encarga del transform de TS/JSX y de los CSS de Next. */
module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
});
