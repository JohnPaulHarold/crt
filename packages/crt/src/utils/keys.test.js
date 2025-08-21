import { describe, expect, test } from 'vitest';
import {
    getDirectionFromKeyCode,
    getOrientationFromDirection,
    assertKey,
    getOrientationFromKeyCode,
} from './keys.js';
import { Direction } from '../models/Direction.js';
import { Orientation } from '../models/Orientation.js';
import { AdditionalKeys } from '../models/AdditionalKeys.js';

describe('keys utilities', () => {
    describe('getDirectionFromKeyCode', () => {
        test('should return the correct direction for arrow keys', () => {
            expect(getDirectionFromKeyCode(37)).toBe(Direction.LEFT);
            expect(getDirectionFromKeyCode(38)).toBe(Direction.UP);
            expect(getDirectionFromKeyCode(39)).toBe(Direction.RIGHT);
            expect(getDirectionFromKeyCode(40)).toBe(Direction.DOWN);
        });

        test('should return the correct value for additional keys', () => {
            expect(getDirectionFromKeyCode(13)).toBe(AdditionalKeys.ENTER);
            expect(getDirectionFromKeyCode(27)).toBe(AdditionalKeys.ESCAPE);
        });

        test('should return undefined for an unknown key code', () => {
            expect(getDirectionFromKeyCode(999)).toBeUndefined();
        });
    });

    describe('getOrientationFromDirection', () => {
        test('should return HORIZONTAL for LEFT and RIGHT directions', () => {
            expect(getOrientationFromDirection(Direction.LEFT)).toBe(
                Orientation.HORIZONTAL
            );
            expect(getOrientationFromDirection(Direction.RIGHT)).toBe(
                Orientation.HORIZONTAL
            );
        });

        test('should return VERTICAL for UP and DOWN directions', () => {
            expect(getOrientationFromDirection(Direction.UP)).toBe(
                Orientation.VERTICAL
            );
            expect(getOrientationFromDirection(Direction.DOWN)).toBe(
                Orientation.VERTICAL
            );
        });

        test('should return VERTICAL for non-directional keys', () => {
            expect(getOrientationFromDirection(AdditionalKeys.ENTER)).toBe(
                Orientation.VERTICAL
            );
        });
    });

    describe('assertKey', () => {
        test('should return true for a matching single expectation', () => {
            const event = /** @type {KeyboardEvent} */ ({ keyCode: 13 });
            expect(assertKey(event, AdditionalKeys.ENTER)).toBe(true);
        });

        test('should return false for a non-matching single expectation', () => {
            const event = /** @type {KeyboardEvent} */ ({ keyCode: 27 });
            expect(assertKey(event, AdditionalKeys.ENTER)).toBe(false);
        });

        test('should return true if key is in an array of expectations', () => {
            const event = /** @type {KeyboardEvent} */ ({ keyCode: 39 });
            expect(assertKey(event, [Direction.LEFT, Direction.RIGHT])).toBe(
                true
            );
        });

        test('should return false if key is not in an array of expectations', () => {
            const event = /** @type {KeyboardEvent} */ ({ keyCode: 38 });
            expect(assertKey(event, [Direction.LEFT, Direction.RIGHT])).toBe(
                false
            );
        });
    });

    describe('getOrientationFromKeyCode', () => {
        test('should return HORIZONTAL for left and right arrow keys', () => {
            expect(getOrientationFromKeyCode(37)).toBe(Orientation.HORIZONTAL);
            expect(getOrientationFromKeyCode(39)).toBe(Orientation.HORIZONTAL);
        });

        test('should return VERTICAL for up and down arrow keys', () => {
            expect(getOrientationFromKeyCode(38)).toBe(Orientation.VERTICAL);
            expect(getOrientationFromKeyCode(40)).toBe(Orientation.VERTICAL);
        });

        test('should return HORIZONTAL for other keys like Enter', () => {
            // Based on the implementation, non-vertical keys default to horizontal
            expect(getOrientationFromKeyCode(13)).toBe(Orientation.HORIZONTAL);
        });
    });
});
