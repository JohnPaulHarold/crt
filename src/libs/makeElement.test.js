/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import {
    a,
    button,
    div,
    h1,
    h2,
    header,
    img,
    li,
    makeElement,
    nav,
    ol,
    p,
    section,
    span,
    ul,
} from './makeElement';

describe('makeElement', () => {
    test('it creates an element', () => {
        const assert = makeElement('div', {});

        expect(assert).toBeInstanceOf(HTMLDivElement);
    });

    test('it creates an element with text as the child', () => {
        const text = 'xyz';
        const assert1 = makeElement('span', text);

        expect(assert1).toBeInstanceOf(HTMLSpanElement);
        expect(assert1.textContent).toEqual(text);
    });

    test('it creates an element with an element argument', () => {
        const child = makeElement('span', 'xyz');
        const assert = makeElement('p', child);
        const { children } = assert;
        const firstChild = children[0];

        expect(assert).toBeInstanceOf(HTMLParagraphElement);
        expect(children.length).toEqual(1);
        expect(firstChild).toBeInstanceOf(HTMLSpanElement);
    });

    test('it creates an element with attributes', () => {
        const assert = makeElement('span', {
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

        const assert1 = makeElement('p', [
            makeElement('span', {}),
            makeElement('span', {}),
        ]);

        expect(assert1).toBeInstanceOf(HTMLParagraphElement);
        expect(assert1.children.length).toEqual(2);

        const assert2 = makeElement(
            'p',
            attrs,
            ...[makeElement('span', 'x'), makeElement('span', 'y')]
        );

        expect(assert2).toBeInstanceOf(HTMLParagraphElement);
        expect(assert2.getAttribute('id')).toEqual('x');
        expect(assert2.getAttribute('class')).toEqual('y');
        expect(assert2.children.length).toEqual(2);
    });

    test('it creates some style', () => {
        const assert = makeElement('section', {
            style: {
                color: 'red',
                background: 'black',
            },
        });

        expect(assert.getAttribute('style')).toEqual(
            'color: red; background: black;'
        );
    });

    test('it adds data attributes', () => {
        const assert = makeElement('div', {
            dataset: {
                x: '0x00',
                y: '0x01',
            },
        });

        expect(assert.getAttribute('data-x')).toEqual('0x00');
        expect(assert.getAttribute('data-y')).toEqual('0x01');
    });

    [
        p,
        ol,
        li,
        img,
        nav,
        section,
        div,
        span,
        a,
        button,
        h1,
        h2,
        header,
        p,
        ul
    ].forEach((me) =>
        test(`has a shorthand for`, () => {
            expect(me({})).toBeInstanceOf(HTMLElement);
        })
    );
});
