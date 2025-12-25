import { describe, expect, test } from 'vitest';
import { cx } from './cx.js';

describe('cx', () => {
	test('concats c & rt', () => {
		expect(cx('c', 'rt')).toBe('c rt');
	});

	test('concats c & r but not t', () => {
		// eslint-disable-next-line no-constant-binary-expression
		expect(cx('c', 'r', 0 > 1 && 't')).toBe('c r');
	});

	test('returns nothing', () => {
		expect(cx()).toBe('');
	});
});
