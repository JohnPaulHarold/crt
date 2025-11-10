/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Spinner } from './Spinner.js';

describe('Spinner', () => {
	test('construction', () => {
		const assert = Spinner();

		expect(assert).toBeInstanceOf(HTMLElement);
	});

	test('props', () => {
		const assert = Spinner({ props: { id: 'x', className: 'y' } });
		const idAttr = assert.getAttribute('id');
		const classNameAttr = assert.getAttribute('class');
		const textContent = assert.textContent;

		expect(idAttr).toEqual('x');
		expect(classNameAttr).toEqual('y');
		expect(textContent).toEqual('Loading...');
	});

	test('message', () => {
		const message = 'xyz';
		const assert = Spinner({ props: { message } });
		const textContent = assert.textContent;

		expect(textContent).toEqual(message);
	});
});
