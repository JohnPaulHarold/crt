/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, afterEach } from 'vitest';
import { getBaseFontSize } from './getBaseFontSize.js';

describe('getBaseFontSize', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('should return the font size of document.documentElement when no element is provided', () => {
		const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle');
		getComputedStyleSpy.mockReturnValue({
			fontSize: '16px',
		});

		const fontSize = getBaseFontSize();

		expect(getComputedStyleSpy).toHaveBeenCalledWith(document.documentElement);
		expect(fontSize).toBe(16);
	});

	test('should return the font size of the provided element', () => {
		const mockEl = document.createElement('div');
		const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle');
		getComputedStyleSpy.mockReturnValue({
			fontSize: '24px',
		});

		const fontSize = getBaseFontSize(mockEl);

		expect(getComputedStyleSpy).toHaveBeenCalledWith(mockEl);
		expect(fontSize).toBe(24);
	});

	test('should correctly parse a floating point pixel value into an integer', () => {
		const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle');
		getComputedStyleSpy.mockReturnValue({
			fontSize: '18.75px',
		});

		const fontSize = getBaseFontSize();

		// parseInt truncates the decimal part, which is the expected behavior here.
		expect(fontSize).toBe(18);
	});
});
