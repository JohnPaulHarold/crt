/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Heading } from './Heading.js';

const headings: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];

describe('Button', () => {
	test('construction', () => {
		const assert = Heading({}, 'XYZ');

		expect(assert).toBeInstanceOf(HTMLHeadingElement);
	});

	headings.forEach((level) => {
		const nodeName = `h${level}`.toUpperCase();

		test(`level prop of ${level} should create a ${nodeName} element type`, () => {
			const assert = Heading({ level }, 'XYZ');

			expect(assert.nodeName).toEqual(nodeName);
		});
	});
});
