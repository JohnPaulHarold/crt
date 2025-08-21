import { describe, expect, test } from 'vitest';
import { toTitleCase } from './toTitleCase';

describe('toTitleCase', () => {
	test('correctly titles', () => {
		expect(toTitleCase('cathode ray-tube')).toBe('Cathode Ray-tube');
	});

	test('returns an empty string with no args', () => {
		// @ts-expect-error
		expect(toTitleCase()).toBe('');
	});
});
