// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');

/**
 * The `no-restricted-imports` blocks below are the layering contract from
 * docs/ARCHITECTURE.md, enforced by the linter rather than by memory.
 * If one of these fires, the fix is almost never to add an exception.
 */
module.exports = defineConfig([
  expoConfig,
  prettier,
  { ignores: ['dist/*', 'coverage/*', '.expo/*', 'ios/*', 'android/*'] },

  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-native', 'expo', 'expo-*', '@expo/*', 'react-native-*'],
              message:
                'Domain code must stay pure so it runs in plain Jest. Move the side effect into src/services/.',
            },
            {
              group: ['@/data/*', '@/services/*', '@/store/*', '@/ui/*', '@/app/*'],
              message: 'Domain may only import from @/contracts and @/lib.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/app/**/*.tsx', 'src/app/**/*.ts', 'src/ui/**/*.tsx', 'src/ui/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/data/*', '@/data'],
              message:
                'UI never touches SQLite directly. Go through the store (@/store) — see contracts/store.ts.',
            },
            {
              group: ['@/domain/*', '@/domain'],
              message:
                'UI reads derived state from the store selectors, not from domain functions directly.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/ui/*', '@/app/*', '@/services/*'],
              message: 'The data layer is a leaf. It must not depend on UI or services.',
            },
          ],
        },
      ],
    },
  },
]);
