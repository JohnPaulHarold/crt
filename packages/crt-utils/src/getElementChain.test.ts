/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { getElementChain } from './getElementChain.js';

describe('createReactive', () => {
	test('gets chain', () => {
		const str = `<ul><li>1</li><li><span id="x">x</span></li></ul>`;
		const parser = new DOMParser();
		const mockDom = parser.parseFromString(str, 'text/html');
		const el = mockDom.getElementById('x');

		const assert = el && getElementChain(el);
		const expectedType = Array;
		const expectedElements = [
			HTMLHtmlElement,
			HTMLBodyElement,
			HTMLUListElement,
			HTMLLIElement,
			HTMLSpanElement,
		];

		expect(assert).toBeInstanceOf(expectedType);

		if (assert instanceof Array) {
			assert.forEach((el, i) => {
				expect(el).toBeInstanceOf(expectedElements[i]);
			});
		}
	});
});
