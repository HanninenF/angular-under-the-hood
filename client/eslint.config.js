const js = require('@eslint/js');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const prettier = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      '.angular/**',
      'node_modules/**',
      'eslint.config.js',
      'stylelint.config.js',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Keep the same general code-shape limits as the React Native repo, but
  // apply them to Angular TypeScript and templates instead of style objects.
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@angular-eslint': angular,
    },
    rules: {
      ...angular.configs.recommended.rules,

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-lines-per-function': [
        'warn',
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['warn', 15],
      'max-params': ['warn', 4],

      // Angular styling usually lives in CSS or templates, but inline styles in
      // component metadata are still worth guarding.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Property[key.name='styles'] Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            'Use shared theme variables or CSS tokens instead of hardcoded hex colors.',
        },
        {
          selector: "Property[key.name='styles'] Literal[value=/^rgba?\\(/]",
          message:
            'Use shared theme variables or CSS tokens instead of hardcoded rgb/rgba colors.',
        },
      ],
    },
  },

  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      ...angularTemplate.configs.accessibility.rules,
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/no-call-expression': 'warn',
    },
  },

  prettier,
);
