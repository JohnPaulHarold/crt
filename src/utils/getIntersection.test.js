import { describe, expect, test } from 'vitest';
import { getIntersection } from './getIntersection';

describe('getIntersection', () => {
    test('gets an intersection between two arrays', () => {
        const arr1 = [0, 1, 2, 3];
        const arr2 = [2, 3, 4, 5];

        const assert = getIntersection(arr1, arr2);
        const expectation = [2, 3];

        expect(assert).toEqual(expectation);
    });

    test('gets an intersection between two arrays of objects', () => {
        const a = { value: 0x0a };
        const b = { value: 0x0b };
        const c = { value: 0x0c };
        const d = { value: 0x0d };
        const e = { value: 0x0e };
        const f = { value: 0x0f };

        const arr1 = [a, b, c, d];
        const arr2 = [c, d, e, f];

        const assert = getIntersection(arr1, arr2);
        const expectation = [c, d];

        expect(assert).toEqual(expectation);
    });

    test('gets the lack of any intersection between two arrays', () => {
        const arr1 = [0, 1, 2, 3];
        const arr2 = [4, 5, 6, 7];

        const assert = getIntersection(arr1, arr2);
        /**
         * @type {number[]}
         */
        const expectation = [];

        expect(assert).toEqual(expectation);
    });
});
