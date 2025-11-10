import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		// This is the most important part: it tells ESLint to ignore all
		// generated directories and files.
		ignores: [
			'dist/',
			'docs/',
			'node_modules/',
			'packages/*/dist/',
			'packages/*/public/polyfills/',
			'types/',
		],
	},
	// This configures ESLint to use the recommended rules for both
	// JavaScript and TypeScript.
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
				},
			],
		},
	},
]);
