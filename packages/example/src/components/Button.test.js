/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
	test('construction', () => {
		const assert = Button({}, 'XYZ');

		expect(assert).toBeInstanceOf(HTMLButtonElement);
	});

	test('`className` prop should add custom className', () => {
		const c = 'xyz';
		const assert = Button({ className: c }, 'XYZ');

		expect(assert.className).toContain(c);
	});

	test('`ghost` prop should add "ghost" className', () => {
		const assert = Button({ ghost: true }, 'XYZ');

		expect(assert.className).toContain('ghost');
	});
});
