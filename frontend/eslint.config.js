import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
      // React clears event.currentTarget once the handler returns, so reading it
      // inside a state updater (which runs later) crashes with "currentTarget is null".
      'no-restricted-syntax': ['error', {
        selector: "CallExpression[callee.name=/^set[A-Z]/] > ArrowFunctionExpression MemberExpression[property.name='currentTarget']",
        message: 'Read event.currentTarget before calling the state setter, then use the captured value.',
      }, {
        selector: "CallExpression[callee.property.name=/^set[A-Z]/] > ArrowFunctionExpression MemberExpression[property.name='currentTarget']",
        message: 'Read event.currentTarget before calling the state setter, then use the captured value.',
      }],
    },
  },
])
