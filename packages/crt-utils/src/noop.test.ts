import { describe, expect, test } from 'vitest';
import { noop } from './noop.js';

describe('noop', () => {
	test('should be a function', () => {
		expect(typeof noop).toBe('function');
	});

	test('should return undefined when called', () => {
		expect(noop()).toBeUndefined();
	});

	test('should not throw an error when called', () => {
		expect(() => noop()).not.toThrow();
	});
});
