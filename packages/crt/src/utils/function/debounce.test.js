/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should call the callback after the specified delay', () => {
        const callback = vi.fn();
        debounce(callback, 200);

        // Immediately, the callback should not have been called
        expect(callback).not.toHaveBeenCalled();

        // Advance time by the specified delay
        vi.advanceTimersByTime(200);

        // Now the callback should have been called exactly once
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should reset the timer if called again before the delay has passed', () => {
        const callback = vi.fn();

        // First call
        debounce(callback, 200);

        // Advance time, but not enough for the timer to fire
        vi.advanceTimersByTime(100);
        expect(callback).not.toHaveBeenCalled();

        // Second call, which should reset the timer
        debounce(callback, 200);

        // Advance time again, just past the original firing time
        vi.advanceTimersByTime(100);
        expect(callback).not.toHaveBeenCalled(); // Still shouldn't have fired

        // Advance time to complete the second timer's delay
        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1); // Should have fired now
    });

    test('should only execute the final call when called multiple times rapidly', () => {
        const callback = vi.fn();

        debounce(callback, 100);
        debounce(callback, 100);
        debounce(callback, 100);

        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should be cancelled by a subsequent call with a different callback', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        debounce(callback1, 100);
        debounce(callback2, 100); // This cancels the timer for callback1

        vi.advanceTimersByTime(100);
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledTimes(1);
    });
});
