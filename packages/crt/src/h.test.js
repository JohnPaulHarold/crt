/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { h } from './h.js';

describe('h', () => {
    test('it creates an element', () => {
        const assert = h('div', {});

        expect(assert).toBeInstanceOf(HTMLDivElement);
    });

    test('it creates an element with text as the child', () => {
        const text = 'xyz';
        const assert1 = h('span', text);

        expect(assert1).toBeInstanceOf(HTMLSpanElement);
        expect(assert1.textContent).toEqual(text);
    });

    test('it creates an element with an element argument', () => {
        const child = h('span', 'xyz');
        const assert = h('p', child);
        const { children } = assert;
        const firstChild = children[0];

        expect(assert).toBeInstanceOf(HTMLParagraphElement);
        expect(children.length).toEqual(1);
        expect(firstChild).toBeInstanceOf(HTMLSpanElement);
    });

    test('it creates an element with attributes', () => {
        const assert = h('span', {
            id: 'x',
            className: 'y',
        });

        expect(assert).toBeInstanceOf(HTMLSpanElement);
        expect(assert.getAttribute('id')).toEqual('x');
        expect(assert.getAttribute('class')).toEqual('y');
    });

    test('it creates an element with children', () => {
        const attrs = {
            id: 'x',
            className: 'y',
        };

        const assert1 = h('p', [h('span', {}), h('span', {})]);

        expect(assert1).toBeInstanceOf(HTMLParagraphElement);
        expect(assert1.children.length).toEqual(2);

        const assert2 = h('p', attrs, ...[h('span', 'x'), h('span', 'y')]);

        expect(assert2).toBeInstanceOf(HTMLParagraphElement);
        expect(assert2.getAttribute('id')).toEqual('x');
        expect(assert2.getAttribute('class')).toEqual('y');
        expect(assert2.children.length).toEqual(2);
    });

    test('it creates some style', () => {
        const assert = h('section', {
            style: {
                color: 'red',
                background: 'black',
            },
        });

        expect(assert.getAttribute('style')).toEqual(
            'color: red; background: black;'
        );
    });

    test('it creates an element with no props or children', () => {
        const assert = h('div');
        expect(assert).toBeInstanceOf(HTMLDivElement);
        expect(assert.children.length).toBe(0);
        expect(assert.textContent).toBe('');
    });

    test('it warns on invalid properties', () => {
        const consoleWarnSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => {});
        h('div', { invalidProp: 'foo' });
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            'invalidProp is not a valid property of a <div>'
        );
        consoleWarnSpy.mockRestore();
    });

    test('it sets attributes from the exception list', () => {
        const assert = h('div', { role: 'button' });
        expect(assert.getAttribute('role')).toBe('button');
    });

    test('it sets attributes for empty strings', () => {
        const assert = h('div', { id: '' });
        expect(assert.getAttribute('id')).toBe('');
    });

    test('it handles boolean false attributes correctly', () => {
        const assert = h('input', { disabled: false });
        expect(assert.disabled).toBe(false);
    });

    test('it handles null as props argument', () => {
        const child = h('span');
        const assert = h('div', null, child);
        expect(assert.children.length).toBe(1);
        expect(assert.children[0]).toBeInstanceOf(HTMLSpanElement);
    });

    test('it ignores null and undefined children in an array', () => {
        const assert = h('div', [
            h('span', 'one'),
            null,
            h('span', 'two'),
            undefined,
        ]);
        expect(assert.children.length).toBe(2);
        expect(assert.children[0].textContent).toBe('one');
        expect(assert.children[1].textContent).toBe('two');
    });

    test('it handles deeply nested children arrays', () => {
        const assert = h('div', [
            h('span', 'one'),
            [h('span', 'two'), [h('p', 'three')]],
        ]);
        expect(assert.children.length).toBe(3);
        expect(assert.children[0].tagName).toBe('SPAN');
        expect(assert.children[1].tagName).toBe('SPAN');
        expect(assert.children[2].tagName).toBe('P');
        expect(assert.textContent).toBe('onetwothree');
    });

    test('it adds data attributes', () => {
        const assert = h('div', {
            dataset: {
                x: '0x00',
                y: '0x01',
            },
        });

        expect(assert.getAttribute('data-x')).toEqual('0x00');
        expect(assert.getAttribute('data-y')).toEqual('0x01');
    });
});
