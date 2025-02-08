/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  transform: {
    "^.+\\.[tj]sx?$": ["babel-jest", { configFile: "./babel-jest.config.js" }],
  },
  testEnvironment: "node",
  setupFiles: ["./jest.setup.js"],
};

module.exports = config;