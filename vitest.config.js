import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    test: {
        // Use jsdom to simulate a browser environment for tests
        environment: 'jsdom',
        // A glob pattern to find all test files in all packages
        include: ['packages/**/*.{test,spec}.{js,ts}'],
        // Clear cache before running tests to avoid stale file issues
        clearCache: {
            onStart: true,
        },
    },
    resolve: {
        alias: {
            'crt': path.resolve(__dirname, './packages/crt/src/index.js'),
        },
    },
});