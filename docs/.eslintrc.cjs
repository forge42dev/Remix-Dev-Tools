/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    impliedStrict: true,
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'multiline-tenary': 'off',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
      },
    ],
    strict: 'error',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'sort-destructure-keys/sort-destructure-keys': 'error',
    'import/no-unresolved': [2, { caseSensitive: false }],
    '@typescript-eslint/no-explicit-any': 'off',
  },
  processor: 'disable/disable',
  extends: [
    'eslint:recommended',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:prettier/recommended',
    'standard',
    'plugin:import/typescript',
    'plugin:import/errors',
  ],
  plugins: [
    'simple-import-sort',
    'import',
    'disable',
    'sort-destructure-keys',
    'node',
  ],
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: ['react', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
        formComponents: ['Form'],
        linkComponents: [
          { name: 'Link', linkAttribute: 'to' },
          { name: 'NavLink', linkAttribute: 'to' },
        ],
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['import'],
      parser: '@typescript-eslint/parser',
      settings: {
        'import/internal-regex': '^~/',
        'import/resolver': {
          node: {
            extensions: ['.ts', '.tsx'],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: ['plugin:import/recommended', 'plugin:import/typescript'],
    },
    {
      files: ['.eslintrc.js'],
      env: {
        node: true,
      },
    },
  ],
  ignorePatterns: ['**/node_modules/**', '**/build/**', '**/*.d.ts'],
}
