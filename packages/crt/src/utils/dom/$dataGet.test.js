/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { $dataGet } from './$dataGet';

describe('$dataGet', () => {
    test('it will return boolean value of data-prop from HTMLElement', () => {
        const mockEl = document.createElement('div');
        mockEl.dataset.boolean = 'true';

        const assert = $dataGet(mockEl, 'boolean');

        expect(assert).toEqual(true);
    });

    test('it will return value of data-prop from HTMLElement', () => {
        const mockEl = document.createElement('div');
        mockEl.dataset.complex = '{"x": 1, "y": true, "z": "test"}';

        const assert = $dataGet(mockEl, 'complex');

        expect(assert).toEqual({
            x: 1,
            y: true,
            z: 'test',
        });
    });

    test('it will return value of data-prop from HTMLElement', () => {
        const mockEl = document.createElement('div');
        mockEl.dataset.number = '1';

        const assert = $dataGet(mockEl, 'number');

        expect(assert).toEqual(1);
    });

    test('it will return emoty string if no such data-prop', () => {
        const mockEl = document.createElement('div');
        mockEl.dataset.number = '1';

        const assert = $dataGet(mockEl, 'noprop');

        expect(assert).toBe('');
    });
});
