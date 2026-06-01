export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.cjs"],
  testMatch: [
    "**/tests/**/*.test.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  transform: {},
  moduleNameMapper: {
    "^@aws-sdk/client-s3$": "<rootDir>/src/__mocks__/@aws-sdk/client-s3.js",
    ".*lib/prisma\\.js$":   "<rootDir>/src/__mocks__/prisma.js",
  },
  verbose: true,
  detectOpenHandles: true,
};
