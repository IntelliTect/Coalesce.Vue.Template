module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "vue"],
  transform: {
    ".*\\.vue$": "@vue/vue2-jest",
    ".*\\.js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!coalesce-vue)/"],
  setupFiles: ["./tests/setupTests"],
  testMatch: [
    "<rootDir>/tests/unit/**/*.spec.(ts|tsx|js)",
    "**/__tests__/*.(ts|tsx|js))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: false,
};
