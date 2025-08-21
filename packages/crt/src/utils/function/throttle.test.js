/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createThrottle } from './throttle.js';

describe('createThrottle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should call the callback after the specified time', () => {
        const callback = vi.fn();
        const throttledFn = createThrottle(callback, 100);
        const args = [1, 'test'];
        throttledFn(...args);

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
        const throttledFn = createThrottle(callback, 100);

        throttledFn(); // First call
        throttledFn(); // Second call (should be ignored)
        throttledFn(); // Third call (should be ignored)

        vi.advanceTimersByTime(100);

        // Only the first call's timeout should execute
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should allow a new call after the throttle period has ended', () => {
        const callback = vi.fn();
        const throttledFn = createThrottle(callback, 100);

        // First call
        throttledFn();
        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1);

        // Second call, after the first one has completed
        throttledFn();
        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    test('should pass arguments correctly to the callback', () => {
        const callback = vi.fn();
        const throttledFn = createThrottle(callback, 50);
        const testArgs = [{ a: 1 }, 'hello'];
        throttledFn(...testArgs);

        vi.advanceTimersByTime(50);
        expect(callback).toHaveBeenCalledWith({ a: 1 }, 'hello');
    });

    test('should not interfere with other throttled functions', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        const throttledFn1 = createThrottle(callback1, 100);
        const throttledFn2 = createThrottle(callback2, 100);

        throttledFn1();
        throttledFn2(); // Should not be blocked by the first one

        vi.advanceTimersByTime(100);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });
});
