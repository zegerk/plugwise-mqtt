module.exports = {
  env: {browser: true, es2020: true},
  extends: ['prettier', 'google', 'plugin:json/recommended-with-comments'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'ignore',
        named: 'ignore',
        asyncArrow: 'ignore',
      },
    ],
    'quote-props': ['error', 'as-needed'],
    semi: ['error', 'never'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'operator-linebreak': [
      'error',
      'after',
      {overrides: {'?': 'before', ':': 'before'}},
    ],
    indent: [
      'error',
      2,
      {SwitchCase: 1, FunctionDeclaration: {body: 1, parameters: 1}},
    ],
  },
}
