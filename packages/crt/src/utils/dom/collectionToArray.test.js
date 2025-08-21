/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { collectionToArray } from './collectionToArray';

describe('collectionToArray', () => {
	test('converts a HTMLCollection to an array', () => {
		const str = `<ul><li>1</li><li>2</li></ul>`;
		let parser = new DOMParser();
		let mockDom = parser.parseFromString(str, 'text/html');
		const collection = mockDom.querySelectorAll('li');

		if (collection) {
			const assert = collectionToArray(collection);

			expect(assert).toBeInstanceOf(Array);
			assert.forEach((el) => {
				expect(el).toBeInstanceOf(HTMLLIElement);
			});
		}
	});
});
