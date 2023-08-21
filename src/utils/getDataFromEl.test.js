/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { getDataFromEl } from './getDataFromEl';

describe('getDataFromEl', () => {
    test('it will return value of data-prop from HTMLElement', () => {
        const mockEl = document.createElement('div');
        mockEl.dataset.x = '1';

        const assert = getDataFromEl(mockEl, 'x');

        expect(assert).toEqual('1');
    });

    test('it will return undefined if no such data-prop', () => {
        const mockEl = document.createElement('div');
        mockEl.dataset.x = '1';

        const assert = getDataFromEl(mockEl, 'y');

        expect(assert).toBeUndefined();
    });
});
