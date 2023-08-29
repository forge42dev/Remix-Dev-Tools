module.exports = {
  env: { browser: true, es2020: true },
  ignorePatterns: [
    "node_modules",
    "dist",
    "src/remix-app-for-testing",
    "src/epic-stack-remix-dev-tools",
    "src/documentation",
    ".eslintrc.cjs",
    "tailwind.config.js",
  ],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "warn",
  },
};
