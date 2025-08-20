import { describe, expect, test } from 'vitest';
import { parseSearchParams } from './parseSearchParams';

describe('parseSearchParams', () => {
    test('parse something', () => {
        const paramsString = 'x=1&y=2';
        const assert = parseSearchParams(paramsString);
        const expectation = { x: 1, y: 2 };

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
        const expectation = { x: 1, y: 2, z: '' };

        expect(assert).toEqual(expectation);
    });

    test('should parse boolean true values', () => {
        const paramsString = 'active=true';
        expect(parseSearchParams(paramsString)).toEqual({ active: true });
    });

    test('should parse boolean false values', () => {
        const paramsString = 'isAdmin=false';
        expect(parseSearchParams(paramsString)).toEqual({ isAdmin: false });
    });

    test('should handle mixed types correctly', () => {
        const paramsString = 'name=test&count=42&live=true';
        expect(parseSearchParams(paramsString)).toEqual({
            name: 'test',
            count: 42,
            live: true,
        });
    });

    test('should handle valueless keys', () => {
        const paramsString = 'foo&bar=baz';
        expect(parseSearchParams(paramsString)).toEqual({
            foo: '',
            bar: 'baz',
        });
    });
});
