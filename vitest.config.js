import { defineConfig } from 'vitest/config';

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
});
