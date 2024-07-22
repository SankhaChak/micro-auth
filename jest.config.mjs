/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}]
  },
  verbose: true,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/tests/*.spec.ts",
    "!node_modules/**",
    "!dist/**"
  ]
};
