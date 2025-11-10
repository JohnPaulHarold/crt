import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToString } from './renderToString.js';
import { h } from '../h.js';
import { getPlatform, setPlatform } from '../platform.js';
import { serverPlatform } from './platform.js';
import type { BaseViewInstance } from '../types.js';

// Keep a reference to the real browser platform for restoration tests
const originalBrowserPlatform = getPlatform();

const createMockView = (renderFunc: () => Element): BaseViewInstance => ({
	id: 'mock-view',
	viewEl: null,
	preserveAttributes: [],
	attach: vi.fn(),
	detach: vi.fn(),
	hydrate: vi.fn(),
	render: renderFunc,
});

describe('renderToString', () => {
	beforeEach(() => {
		// Ensure each test starts with a clean slate, using the server platform.
		// The function itself also does this, but it's good practice for testing.
		setPlatform(serverPlatform);
	});

	afterEach(() => {
		// Restore the original platform after each test to avoid side-effects
		setPlatform(originalBrowserPlatform);
	});

	test('should render a simple element to a string', () => {
		const view = createMockView(() =>
			h('div', { props: { id: 'test' }, children: 'Hello World' })
		);
		const html = renderToString(view);
		expect(html).toBe('<div id="test">Hello World</div>');
	});

	test('should render nested elements correctly', () => {
		const view = createMockView(() =>
			h('section', {
				props: { className: 'container' },
				children: [
					h('h1', { children: 'Title' }),
					h('p', { children: 'Some text.' }),
				],
			})
		);
		const html = renderToString(view);
		expect(html).toBe(
			'<section class="container"><h1>Title</h1><p>Some text.</p></section>'
		);
	});

	test('should serialize style objects into inline styles', () => {
		const view = createMockView(() =>
			h('div', { props: { style: { color: 'red', fontSize: '16px' } } })
		);
		const html = renderToString(view);
		expect(html).toBe('<div style="color:red;font-size:16px"></div>');
	});

	test('should handle attributes and styles together', () => {
		const view = createMockView(() =>
			h('a', {
				props: {
					href: '#',
					className: 'link',
					style: { textDecoration: 'none' },
				},
			})
		);
		const html = renderToString(view);
		expect(html).toBe(
			'<a href="#" class="link" style="text-decoration:none"></a>'
		);
	});

	test('should correctly render self-closing tags', () => {
		const view = createMockView(() =>
			h('img', { props: { src: 'test.png', alt: 'An image' } })
		);
		const html = renderToString(view);
		expect(html).toBe('<img src="test.png" alt="An image">');
	});

	test('should escape double quotes in attribute values', () => {
		const view = createMockView(() =>
			h('div', { props: { 'data-json': '{"key":"value"}' } })
		);
		const html = renderToString(view);
		expect(html).toBe(
			'<div data-json="{&quot;key&quot;:&quot;value&quot;}"></div>'
		);
	});

	test('should restore the original platform after a successful render', () => {
		const view = createMockView(() => h('div', {}));
		// Start with the browser platform
		setPlatform(originalBrowserPlatform);

		expect(getPlatform().isBrowser).toBe(true);
		renderToString(view);
		// Should be restored to the browser platform
		expect(getPlatform().isBrowser).toBe(true);
	});

	test('should restore the original platform even if rendering fails', () => {
		const error = new Error('Render failed!');
		const view = createMockView(() => {
			throw error;
		});
		// Start with the browser platform
		setPlatform(originalBrowserPlatform);

		expect(getPlatform().isBrowser).toBe(true);

		// Expect the function to throw, but check the platform in a finally block
		expect(() => renderToString(view)).toThrow(error);

		// The `finally` block in renderToString should have restored the platform
		expect(getPlatform().isBrowser).toBe(true);
	});
});
