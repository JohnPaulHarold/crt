import { describe, expect, test } from 'vitest';
import { parseSearchParams } from './parseSearchParams';

describe('parseSearchParams', () => {
    test('parse something', () => {
        const paramsString = 'x=1&y=2';
        const assert = parseSearchParams(paramsString);
        const expectation = { x: '1', y: '2' };

        expect(assert).toEqual(expectation);
    });

    test('parse nothing', () => {
        const paramsString = '';
        const assert = parseSearchParams(paramsString);
        const expectation = {};

        expect(assert).toEqual(expectation);
    });

    test('parse partial', () => {
        const paramsString = 'x=1&y=2&z=';
        const assert = parseSearchParams(paramsString);
        const expectation = { x: '1', y: '2', z: '' };

        expect(assert).toEqual(expectation);
    });
});
