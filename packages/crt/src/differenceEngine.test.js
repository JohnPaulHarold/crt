/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { diff, stringToHTML } from './differenceEngine.js';

describe('differenceEngine', () => {
	test('it adds various attributes', () => {
		const existing = stringToHTML(`
            <div>
                <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                    <li>4</li>
                </ul>
            </div>
        `);

		const template = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

		diff(template.cloneNode(true), existing);

		expect(existing).toEqual(template);
		expect(existing.classList.contains('x')).toBe(true);
		['a', 'b', 'c', 'd'].forEach((id) => {
			expect(existing.querySelector(`li#${id}`)).toBeTruthy();
		});
	});

	test('it removes various attributes', () => {
		const existing = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

		const template = stringToHTML(`
            <div>
                <ul>
                    <li id='a1'>1</li>
                    <li id='b'>2</li>
                    <li id='c1'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

		diff(template.cloneNode(true), existing);

		expect(existing).toEqual(template);
		expect(existing.querySelector('.x')).toBeFalsy();
		['a1', 'b', 'c1', 'd'].forEach((id) => {
			expect(existing.querySelector(`li#${id}`)).toBeTruthy();
		});
	});

	test('it removes class tokens', () => {
		const existing = stringToHTML(`
            <div class="x y z"></div>
        `);

		const template = stringToHTML(`
            <div class="x y"></div>
        `);

		diff(template.cloneNode(true), existing);

		expect(existing).toEqual(template);
		expect(existing.querySelector('.z')).toBeFalsy();
	});

	test('it adds class tokens', () => {
		const existing = stringToHTML(`
            <div class="x y"></div>
        `);

		const template = stringToHTML(`
            <div class="x y z"></div>
        `);

		diff(template.cloneNode(true), existing);

		expect(existing).toEqual(template);
		expect(existing.classList.contains('z')).toBe(true);
	});

	test('it adds nodes', () => {
		const existing = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                </ul>
            </div>
        `);

		const template = stringToHTML(`
            <div class="x">
                <img class="image" src="path/to/image.img" />
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

		diff(template.cloneNode(true), existing);

		expect(existing.querySelector('.image')).toBeTruthy();
		expect(existing).toEqual(template);
	});

	test('it removes nodes', () => {
		const existing = stringToHTML(`
            <div class="x">
                <img class="image" src="path/to/image.img" />
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

		const template = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                </ul>
            </div>
        `);

		diff(template.cloneNode(true), existing);

		expect(existing).toEqual(template);
		expect(existing.querySelector('.image')).toBeFalsy();
		['a', 'b'].forEach((id) => {
			expect(existing.querySelector(`li#${id}`)).toBeTruthy();
		});
		['c', 'd'].forEach((id) => {
			expect(existing.querySelector(`li#${id}`)).toBeFalsy();
		});
	});

	test('it removes script tags', () => {
		const existing = stringToHTML(`
            <div class="x"></div>
        `);

		const template = stringToHTML(`
            <div class="x">
                <script>document.write("x")</script>
            </div>
        `);
		diff(template.cloneNode(true), existing);
		expect(existing).not.toEqual(template);
		expect(existing.getElementsByTagName('script')).toHaveLength(0);
	});
});

describe('differenceEngine - advanced diffing', () => {
	test('it updates text content', () => {
		const existing = stringToHTML(`<p>Old text</p>`);
		const template = stringToHTML(`<p>New text</p>`);
		diff(template.cloneNode(true), existing);
		expect(existing.textContent).toBe('New text');
	});

	test('it replaces a node if the tag name is different', () => {
		const parent = document.createElement('div');
		const existing = stringToHTML(`<span>Old node</span>`);
		parent.appendChild(existing);
		const template = stringToHTML(`<p>New node</p>`);

		diff(template, existing); // Pass the template directly, it will be moved

		expect(parent.innerHTML).toBe('<p>New node</p>');
		expect(parent.children[0].tagName).toBe('P');
	});

	test('it preserves focus on an element after a diff', () => {
		const parent = document.createElement('div');
		const existing = stringToHTML(`
            <div>
                <button id="btn1">One</button>
                <button id="btn2">Two</button>
            </div>
        `);
		parent.appendChild(existing);
		document.body.appendChild(parent); // Element must be in document to receive focus

		const btn2 = parent.querySelector('#btn2');
		btn2.focus();
		expect(document.activeElement).toBe(btn2);

		// A new VDOM where the text of the focused button changes
		const template = stringToHTML(`
            <div>
                <button id="btn1">One</button>
                <button id="btn2">Two Updated</button>
            </div>
        `);

		diff(template, existing);

		// Focus should be restored to the element with the same ID
		const newBtn2 = parent.querySelector('#btn2');
		expect(document.activeElement).toBe(newBtn2);
		expect(newBtn2.textContent).toBe('Two Updated');

		document.body.removeChild(parent); // Clean up
	});

	test('it updates stale event handlers', () => {
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		const existing = stringToHTML(`<button id="btn">Click</button>`);
		existing.onclick = handler1;

		const template = stringToHTML(`<button id="btn">Click</button>`);
		template.onclick = handler2; // New handler

		diff(template, existing);

		existing.click();

		expect(handler1).not.toHaveBeenCalled();
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	test('it updates stale form field values', () => {
		const existing = stringToHTML(`<input type="text" value="old">`);
		const template = stringToHTML(`<input type="text" value="new">`);

		diff(template, existing);

		expect(existing.value).toBe('new');
	});

	test('stringToHTML should convert a valid HTML string to a DOM node', () => {
		const html = '<div><span>Test</span></div>';
		const node = stringToHTML(html);
		expect(node).toBeInstanceOf(HTMLDivElement);
		expect(node.querySelector('span').textContent).toBe('Test');
	});
});
