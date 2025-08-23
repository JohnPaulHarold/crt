/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, afterEach } from 'vitest';
import { scale } from './scale.js';

describe('scale', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('should scale up when window height is smaller than the default base (1080)', () => {
		// Mock window.innerHeight to be half of the default base
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(540);

		// The ratio should be 1080 / 540 = 2.
		// The scaled value should be 100 * 2 = 200.
		expect(scale(100)).toBe(200);
	});

	test('should scale down when window height is larger than the default base (1080)', () => {
		// Mock window.innerHeight to be double the default base
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(2160);

		// The ratio should be 1080 / 2160 = 0.5.
		// The scaled value should be 200 * 0.5 = 100.
		expect(scale(200)).toBe(100);
	});

	test('should not scale when window height is equal to the default base (1080)', () => {
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080);

		// The ratio should be 1080 / 1080 = 1.
		// The scaled value should be unchanged.
		expect(scale(150)).toBe(150);
	});

	test('should use a custom base value for scaling', () => {
		// Mock window.innerHeight
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(500);

		// Use a custom base of 1000.
		// The ratio should be 1000 / 500 = 2.
		// The scaled value should be 100 * 2 = 200.
		expect(scale(100, 1000)).toBe(200);
	});

	test('should handle floating point ratios correctly', () => {
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(720);

		// The ratio should be 1080 / 720 = 1.5.
		// The scaled value should be 100 * 1.5 = 150.
		expect(scale(100)).toBe(150);
	});

	test('should return 0 when the input px is 0', () => {
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(500);

		expect(scale(0)).toBe(0);
	});
});
