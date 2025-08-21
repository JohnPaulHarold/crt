import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			// Using 'v8' is recommended for projects that don't require complex
			// source map transformations and is generally faster.
			provider: 'v8',
			reporter: ['text', 'json', 'html'],

			// This is the key part: exclude build artifacts, dependencies,
			// and the test files themselves from the coverage report.
			exclude: [
				'**/dist/**',
				'**/node_modules/**',
				'**/*.test.js',
				'**/*.d.ts',
				'**/*.config.js',
				'**/rollup.*.{js|mjs}',
			],
		},
	},
});
