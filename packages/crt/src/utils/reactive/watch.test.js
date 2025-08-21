/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createSignaller } from './createSignaller.js';
import { watch } from './watch.js';

describe('watch', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should call the handler when a signaller changes', () => {
        const s1 = createSignaller('a');
        const handler = vi.fn();

        watch([s1], handler);
        s1.setValue('b');

        vi.runAllTimers();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith([s1]);
    });

    test('should batch multiple changes into a single handler call', () => {
        const s1 = createSignaller('a');
        const s2 = createSignaller(1);
        const handler = vi.fn();

        watch([s1, s2], handler);
        s1.setValue('b');
        s2.setValue(2);

        vi.runAllTimers();

        expect(handler).toHaveBeenCalledTimes(1);
        const changed = handler.mock.calls[0][0];
        expect(changed).toHaveLength(2);
        expect(changed).toContain(s1);
        expect(changed).toContain(s2);
    });

    test('stop function should unregister the watcher', () => {
        const s1 = createSignaller('a');
        const handler = vi.fn();

        const stop = watch([s1], handler);
        stop();

        s1.setValue('b');
        vi.runAllTimers();

        expect(handler).not.toHaveBeenCalled();
    });

    test('handler should receive an array of only the changed signallers', () => {
        const s1 = createSignaller('a');
        const s2 = createSignaller(1); // This one won't change
        const s3 = createSignaller(true);
        const handler = vi.fn();

        watch([s1, s2, s3], handler);
        s1.setValue('b');
        s3.setValue(false);

        vi.runAllTimers();

        expect(handler).toHaveBeenCalledTimes(1);
        const changed = handler.mock.calls[0][0];
        expect(changed).toHaveLength(2);
        expect(changed).toContain(s1);
        expect(changed).toContain(s3);
        expect(changed).not.toContain(s2);
    });
});
