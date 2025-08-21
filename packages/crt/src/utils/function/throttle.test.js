/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { throttle } from './throttle.js';

describe('throttle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should call the callback after the specified time', () => {
        const callback = vi.fn();
        const args = [1, 'test'];
        throttle(callback, 100, args);

        // It should not be called immediately
        expect(callback).not.toHaveBeenCalled();

        // Advance time
        vi.advanceTimersByTime(100);

        // Now it should be called
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(...args);
    });

    test('should ignore subsequent calls within the throttle period', () => {
        const callback = vi.fn();
        throttle(callback, 100, []); // First call
        throttle(callback, 100, []); // Second call (should be ignored)
        throttle(callback, 100, []); // Third call (should be ignored)

        vi.advanceTimersByTime(100);

        // Only the first call's timeout should execute
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should allow a new call after the throttle period has ended', () => {
        const callback = vi.fn();

        // First call
        throttle(callback, 100, []);
        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1);

        // Second call, after the first one has completed
        throttle(callback, 100, []);
        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    test('should pass arguments correctly to the callback', () => {
        const callback = vi.fn();
        const testArgs = [{ a: 1 }, 'hello'];
        throttle(callback, 50, testArgs);

        vi.advanceTimersByTime(50);
        expect(callback).toHaveBeenCalledWith({ a: 1 }, 'hello');
    });
});
