import { describe, test, expect } from 'vitest';
import { serverPlatform } from './platform.js';

describe('serverPlatform', () => {
	test('createElement should create a ServerNode object', () => {
		const el = serverPlatform.createElement('div');
		expect(el).toEqual({
			tagName: 'div',
			attributes: {},
			style: {},
			children: [],
		});
	});

	test('createTextNode should return the text as a string', () => {
		const textNode = serverPlatform.createTextNode('Hello');
		expect(textNode).toBe('Hello');
	});

	test('appendChild should add a child node', () => {
		const parent = serverPlatform.createElement('div');
		const child = serverPlatform.createElement('p');
		serverPlatform.appendChild(parent, child);
		expect(parent.children).toEqual([child]);
	});

	test('appendChild should add a text node', () => {
		const parent = serverPlatform.createElement('div');
		const text = 'Hello';
		const textNode = serverPlatform.createTextNode(text);
		serverPlatform.appendChild(parent, textNode);
		expect(parent.children).toEqual([textNode]);
	});

	test('setAttribute should add an attribute', () => {
		const el = serverPlatform.createElement('div');
		serverPlatform.setAttribute(el, 'id', 'test');
		expect(el.attributes).toEqual({ id: 'test' });
	});

	test('removeAttribute should remove an attribute', () => {
		const el = serverPlatform.createElement('div');
		serverPlatform.setAttribute(el, 'id', 'test');
		serverPlatform.removeAttribute(el, 'id');
		expect(el.attributes).toEqual({});
	});

	test('removeChild should remove a child node', () => {
		const parent = serverPlatform.createElement('div');
		const child1 = serverPlatform.createElement('p');
		const child2 = serverPlatform.createElement('span');
		serverPlatform.appendChild(parent, child1);
		serverPlatform.appendChild(parent, child2);
		serverPlatform.removeChild(parent, child1);
		expect(parent.children).toEqual([child2]);
	});

	test('replaceChild should replace a child node', () => {
		const parent = serverPlatform.createElement('div');
		const oldChild = serverPlatform.createElement('p');
		const newChild = serverPlatform.createElement('span');
		serverPlatform.appendChild(parent, oldChild);
		serverPlatform.replaceChild(parent, newChild, oldChild);
		expect(parent.children).toEqual([newChild]);
	});

	test('setStyles should add styles to the style object', () => {
		const el = serverPlatform.createElement('div');
		serverPlatform.setStyles(el, { color: 'red', fontSize: '16px' });
		expect(el.style).toEqual({ color: 'red', fontSize: '16px' });
	});

	test('setData should add data attributes', () => {
		const el = serverPlatform.createElement('div');
		// Note: The dataSet utility handles camelCase to kebab-case conversion.
		// The platform's setData method expects the final attribute names.
		serverPlatform.setData(el, { userId: '123', theme: 'dark' });
		expect(el.attributes).toEqual({
			'data-userId': '123',
			'data-theme': 'dark',
		});
	});

	test('setAria should add ARIA attributes and ignore null/undefined values', () => {
		const el = serverPlatform.createElement('div');
		serverPlatform.setAria(el, {
			hidden: 'true',
			label: 'Close button',
			checked: undefined, // should be ignored
			valuenow: null, // should be ignored
		});
		expect(el.attributes).toEqual({
			'aria-hidden': 'true',
			'aria-label': 'Close button',
		});
	});

	test('setData should not add data attributes for null or undefined values', () => {
		const el = serverPlatform.createElement('div');
		// Cast to `unknown` to test the function's robustness with invalid input.
		const data = {
			valid: 'true',
			invalid: undefined,
			alsoInvalid: null,
		} as unknown as Record<string, string>;
		serverPlatform.setData(el, data);
		expect(el.attributes).toEqual({ 'data-valid': 'true' });
	});
});
