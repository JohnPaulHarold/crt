/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { removeElement } from './removeElement';

describe('removeElement', () => {
    test('it removes element', () => {
        const parent = document.createElement('ul');
        const child = document.createElement('li');

        parent.appendChild(child);

        expect(parent.children.length).toBe(1);

        removeElement(child);

        expect(parent.children.length).toBe(0);
    });

    test('it does nothing if element is not found', () => {
        const parent = document.createElement('ul');
        const child = document.createElement('li');

        removeElement(child);

        expect(parent.children.length).toBe(0);
    });
});
