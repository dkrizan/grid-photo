import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

const typescriptFilePatterns = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const typescriptConfigs = tseslint.configs['flat/recommended'].map((config) => ({
  files: typescriptFilePatterns,
  ...config,
}));
const reactRecommended = {
  files: ['**/*.{ts,tsx,js,jsx}'],
  ...reactPlugin.configs.flat.recommended,
};
const reactJsxRuntime = {
  files: ['**/*.{tsx,jsx}'],
  ...reactPlugin.configs.flat['jsx-runtime'],
};
const reactHooks = {
  files: ['**/*.{ts,tsx,js,jsx}'],
  ...reactHooksPlugin.configs.flat['recommended-latest'],
};

export default [
  {
    ignores: ['dist', 'node_modules', 'public'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...typescriptConfigs,
  {
    files: typescriptFilePatterns,
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
    },
  },
  reactRecommended,
  reactJsxRuntime,
  reactHooks,
  {
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
