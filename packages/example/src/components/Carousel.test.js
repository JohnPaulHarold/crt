/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Carousel } from './Carousel';
import { div } from '../h.js';

describe('Carousel', () => {
    test('construction', () => {
        const assert = Carousel({ id: 'xyz', orientation: 'vertical' }, [
            div({}, 'X'),
            div({}, 'Y'),
            div({}, 'Z'),
        ]);

        expect(assert).toBeInstanceOf(HTMLElement);
    });

    test('construction with no title', () => {
        const c = 'xyz';
        const assert = Carousel(
            {
                id: 'xyz',
                orientation: 'horizontal',
                className: c,
            },
            [div({}, 'X'), div({}, 'Y'), div({}, 'Z')]
        );
        const heading = assert.querySelector('h2');
        expect(assert.className).toContain(c);
        expect(heading).toBeFalsy();
    });

    test('construction with title', () => {
        const title = 'EX WHY ZED';
        const assert = Carousel(
            {
                id: 'xyz',
                orientation: 'horizontal',
                title,
            },
            [div({}, 'X'), div({}, 'Y'), div({}, 'Z')]
        );
        const heading = assert.querySelector('h2');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toEqual(title);
    });
});
