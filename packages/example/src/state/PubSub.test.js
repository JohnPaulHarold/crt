import { beforeEach, describe, expect, test, vi } from 'vitest';
import { pubSub } from './PubSub';

describe('PubSub', () => {
    beforeEach(() => {
        // Reset the singleton's state before each test to ensure isolation.
        if (pubSub._resetForTesting) pubSub._resetForTesting();
    });

    test('push cb via `on` and expect it to be called', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        pubSub.on(n, m);
        pubSub.emit(n, p);

        expect(m).toHaveBeenCalledWith(p);
    });

    test('push cb via `once` and expect it to be called one time only', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        pubSub.once(n, m);
        pubSub.emit(n, p);
        pubSub.emit(n, p);

        expect(m).toHaveBeenCalledOnce();
    });

    test('remove cb via `off` and expect it not to be called', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        pubSub.on(n, m);
        pubSub.emit(n, p);

        expect(m).toHaveBeenCalledWith(p);

        pubSub.off(n);
        pubSub.emit(n, p);

        expect(m).toHaveBeenCalledTimes(1);
    });

    test('`broadcast`', () => {
        const m1 = vi.fn();
        const m2 = vi.fn();
        const m3 = vi.fn();
        const n1 = 'test1';
        const n2 = 'test2';
        const n3 = 'test3';
        const p = { x: n1, y: n2, z: n3 };

        pubSub.on(n1, m1);
        pubSub.on(n2, m2);
        pubSub.on(n3, m3);

        pubSub.broadcast(p);

        expect(m1).toHaveBeenCalledWith(p);
        expect(m2).toHaveBeenCalledWith(p);
        expect(m3).toHaveBeenCalledWith(p);
    });

    test('`_resetForTesting` should clear all listeners', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        pubSub.on(n, m);

        if (pubSub._resetForTesting) pubSub._resetForTesting();

        pubSub.emit(n, p);
        expect(m).not.toHaveBeenCalled();
    });
});
