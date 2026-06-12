// ESLint flat config — error-catching rules only.
// No style opinions (formatting, quotes, semicolons, max-len, etc.).
// If a rule doesn't catch a real bug, it doesn't belong here.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  // ── Global ignores ───────────────────────────────────
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'app-dist/**',
      'site/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'tmp-npm-cache/**',
      '.npm-cache/**',
    ],
  },

  // ── Base JS recommended (catches no-undef, no-unused-vars, etc.) ──
  js.configs.recommended,

  // ── Base TS recommended (catches no-explicit-any, await-thenable, etc.) ──
  ...tseslint.configs.recommended,

  // ── All project source ───────────────────────────────
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', 'scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      parser: tseslint.parser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'] },
      },
    },
    rules: {
      // ── Bug-catchers: would-have-caught-InstallPrompt and friends ──
      'no-undef': 'error',                 // missing import would be caught here
      'no-unused-vars': ['error', {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-shadow': ['error', {
        builtinGlobals: false,
        allow: ['error', 'warn', 'i', 'e'],
      }],
      'no-redeclare': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',
      'no-unreachable': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-setter-return': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-useless-catch': 'error',
      'no-constant-condition': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-cond-assign': 'error',
      'no-extra-bind': 'error',
      'no-extra-boolean-cast': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-octal': 'error',
      'no-with': 'error',
      'no-throw-literal': 'error',
      'no-return-await': 'error',
      'no-async-promise-executor': 'error',
      'no-template-curly-in-string': 'error',
      'no-misleading-character-class': 'error',
      'no-empty-character-class': 'error',
      'no-prototype-builtins': 'error',
      'no-invalid-regexp': 'error',
      'no-control-regex': 'error',
      'no-ex-assign': 'error',
      'no-constructor-return': 'error',
      'no-loss-of-precision': 'error',
      'no-unused-expressions': 'error',
      'no-unused-private-class-members': 'error',
      'no-unmodified-loop-condition': 'error',
      'array-callback-return': 'error',
      'default-case-last': 'error',
      'default-param-last': 'error',
      'eqeqeq': ['error', 'smart'],
      'radix': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-useless-escape': 'error',
      'no-debugger': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-inner-declarations': 'error',
      'no-invalid-this': 'error',
      'no-multi-str': 'error',
      'no-new': 'error',
      'no-sequences': 'error',
      'no-undef-init': 'error',
      'no-unused-labels': 'error',
      // Style-ish; often intentional (`async () => {}` test wrappers,
      // `new Promise(resolve => setTimeout(resolve, 100))`):
      'no-await-in-loop': 'off',
      'no-promise-executor-return': 'off',
      'require-await': 'off',

      // ── React: catches wrong attribute names, missing keys, direct DOM mutation ──
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-uses-react': 'off', // New JSX transform, no React import needed
      'react/no-children-prop': 'error',
      'react/no-danger': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/no-array-index-key': 'warn',
      'react/void-dom-elements-no-children': 'error',
      'react/self-closing-comp': 'error',
      'react/button-has-type': 'error',
      'react/no-unused-prop-types': 'warn',
      'react/require-render-return': 'error',
      'react/style-prop-object': 'error',
      'react/iframe-missing-sandbox': 'error',
      // Pure style (no bug potential): modern React handles inline arrows fine.
      'react/jsx-no-bind': 'off',
      'react/no-unescaped-entities': 'off',

      // ── React Hooks: the big one ──
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── JSX a11y: real a11y bugs ──
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/media-has-caption': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-onchange': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // ── Import: catches typos in import paths and undefined exports ──
      'import/no-unresolved': ['error', { caseSensitive: true }],
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': 'error',
      'import/no-absolute-path': 'error',
      'import/no-mutable-exports': 'error',

      // ── TypeScript: catches type-level bugs (non-type-aware so we don't
      //    need a tsconfig yet — see the .ts/.tsx block below for the
      //    type-aware rules that run when a project is configured) ──
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-loss-of-precision': 'error',
      // Style; noisy on tests and intentional `() => {}` placeholders:
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  // ── TS/TSX files: enable type-aware rules when a project is configured.
  //    Disabled by default because the codebase is mostly JS; uncomment the
  //    parserOptions.project line and create tsconfig.json to enable
  //    no-floating-promises, no-unsafe-*, await-thenable, etc. ──
  {
    files: ['src/**/*.{ts,tsx}', 'src/components/*.tsx'],
    languageOptions: {
      // parserOptions: { project: './tsconfig.json' },
    },
  },

  // ── Test files: vitest globals, relax some rules ──
  {
    files: ['src/test/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        beforeAll: 'readonly',
        afterEach: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/no-unused-prop-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      // Test files often have intentional `() => {}` and `async () => {}`
      // placeholders for callbacks / waitFor wrappers:
      '@typescript-eslint/no-empty-function': 'off',
      'react/jsx-no-bind': 'off',
      'import/no-duplicates': 'off',
      'no-shadow': 'off',
      'no-promise-executor-return': 'off',
    },
  },

  // ── Node scripts: server-side, no React ──
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'react/jsx-no-bind': 'off',
      'no-promise-executor-return': 'off',
    },
  },
];
