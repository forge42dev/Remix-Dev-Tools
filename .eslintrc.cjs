module.exports = {
  env: { browser: true, es2020: true },
  ignorePatterns: [
    "node_modules",
    "dist", 
    ".eslintrc.cjs",
    "tailwind.config.js",
    "src/external",
    "src/test-apps",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:require-extensions/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "require-extensions"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "warn",
    "@typescript-eslint/no-unnecessary-type-constraint": "off",
  },
};
