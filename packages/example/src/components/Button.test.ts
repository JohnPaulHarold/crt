/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Button } from './Button.js';

describe('Button', () => {
	test('construction', () => {
		const assert = Button({ children: 'XYZ' });

		expect(assert).toBeInstanceOf(HTMLButtonElement);
	});

	test('`className` prop should add custom className', () => {
		const c = 'xyz';
		const assert = Button({ props: { className: c }, children: 'XYZ' });

		expect(assert.className).toContain(c);
	});

	test('`ghost` prop should add "ghost" className', () => {
		const assert = Button({ props: { ghost: true }, children: 'XYZ' });

		expect(assert.className).toContain('ghost');
	});
});
