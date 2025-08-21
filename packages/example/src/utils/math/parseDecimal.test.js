import { describe, expect, test } from 'vitest';
import { parseDecimal } from './parseDecimal.js';

describe('parseDecimal', () => {
    test('should parse a valid positive integer string', () => {
        expect(parseDecimal('123')).toBe(123);
    });

    test('should parse a valid negative integer string', () => {
        expect(parseDecimal('-45')).toBe(-45);
    });

    test('should parse a string of zero', () => {
        expect(parseDecimal('0')).toBe(0);
    });

    test('should handle strings with leading/trailing whitespace', () => {
        expect(parseDecimal('  50  ')).toBe(50);
    });

    test('should parse only the integer part of a float string', () => {
        expect(parseDecimal('123.45')).toBe(123);
    });

    test('should return NaN for a non-numeric string', () => {
        expect(parseDecimal('hello')).toBeNaN();
    });

    test('should return NaN for an empty string', () => {
        expect(parseDecimal('')).toBeNaN();
    });
});