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
  verbose: true,
  detectOpenHandles: true,
};
