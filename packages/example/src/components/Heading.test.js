/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Heading } from './Heading';

/**
 * @type {Array<'h1'|'h2'|'h3'|'h4'|'h5'|'h6'>}
 */
const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

describe('Button', () => {
	test('construction', () => {
		const assert = Heading({}, 'XYZ');

		expect(assert).toBeInstanceOf(HTMLHeadingElement);
	});

	headings.forEach((level) => {
		const nodeName = level.toUpperCase();
		/**
		 * @type {'h1'|'h2'|'h3'|'h4'|'h5'|'h6'}
		 */
		const lp = level;
		test(`level prop of ${lp} should create a ${nodeName} element type`, () => {
			const assert = Heading({ level: lp }, 'XYZ');

			expect(assert.nodeName).toEqual(nodeName);
		});
	});
});
