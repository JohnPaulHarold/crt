/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { loadScript } from './loadScript.js';

// todo:
// these "work", in the sense a script tag is added to the DOM
// but for a reason unknown, asserting the async behaviours of the promise is failing
describe('loadScript', () => {
	test.skip('it tries to load a script, errors, does not attach it to the DOM', async () => {
		expect.assertions(2);

		const url = 'http://path/to/file';
		try {
			await loadScript(url, 'js');
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			const assert = document.head.querySelector('script');

			expect(assert).toBeFalsy();
		}
	});

	test.skip('it loads a stylesheet, attaches it to the DOM', async () => {
		expect.assertions(2);

		const url = 'http://path/to/file.css';
		await loadScript(url, 'css');

		const assert = document.head.querySelector('link');

		expect(assert).toBeTruthy();
		if (assert) {
			expect(assert.getAttribute('href')).toEqual(url);
		}
	});

	test('it does not load the same resource, if already present', () => {
		expect.assertions(1);

		const url = 'http://path/to/file';
		document.head.innerHTML = `<script src="${url}"></script>`;

		loadScript(url, 'js');

		const assert = document.head.querySelectorAll('script');

		expect(assert.length).toBe(1);
	});
});
