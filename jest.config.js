/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  
  transform: {
    "^.+\\.js$": "babel-jest", // Usa babel per trasformare i file JS
  },

  testEnvironment: "node", // Imposta l'ambiente di test per il browser
  setupFiles: ["<rootDir>/jest.setup.js"],
};

module.exports = config;

