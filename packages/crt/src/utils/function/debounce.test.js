/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createDebounce } from './debounce.js';

describe('createDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should call the callback after the specified delay', () => {
        const callback = vi.fn();
        const debouncedFn = createDebounce(callback, 200);
        debouncedFn();

        // Immediately, the callback should not have been called
        expect(callback).not.toHaveBeenCalled();

        // Advance time by the specified delay
        vi.advanceTimersByTime(200);

        // Now the callback should have been called exactly once
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should reset the timer if called again before the delay has passed', () => {
        const callback = vi.fn();
        const debouncedFn = createDebounce(callback, 200);

        // First call
        debouncedFn();

        // Advance time, but not enough for the timer to fire
        vi.advanceTimersByTime(100);
        expect(callback).not.toHaveBeenCalled();

        // Second call, which should reset the timer
        debouncedFn();

        // Advance time again, just past the original firing time
        vi.advanceTimersByTime(100);
        expect(callback).not.toHaveBeenCalled(); // Still shouldn't have fired

        // Advance time to complete the second timer's delay
        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1); // Should have fired now
    });

    test('should only execute the final call when called multiple times rapidly', () => {
        const callback = vi.fn();
        const debouncedFn = createDebounce(callback, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should not be cancelled by a subsequent call with a different callback', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        const debouncedFn1 = createDebounce(callback1, 100);
        const debouncedFn2 = createDebounce(callback2, 100);

        debouncedFn1();
        debouncedFn2(); // This should NOT cancel the timer for callback1

        vi.advanceTimersByTime(100);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
});
