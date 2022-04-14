module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:eslint-plugin-vue/recommended",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "vue/valid-v-slot": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-console": "off",
  },
  ignorePatterns: ["/**/*.g.ts", "webpack.config.aspnetcore-hmr.js"],
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
    },
  ],
};
