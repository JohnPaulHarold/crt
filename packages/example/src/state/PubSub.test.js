import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PubSub } from './PubSub';

/**
 * @type {PubSub}
 */
let ps;

describe('PubSub', () => {
    beforeEach(() => {
        ps = new PubSub();
    });

    test('push cb via `on` and expect it to be called', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        ps.on(n, m);
        ps.emit(n, p);

        expect(m).toHaveBeenCalledWith(p);
    });

    test('push cb via `once` and expect it to be called one time only', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        ps.once(n, m);
        ps.emit(n, p);
        ps.emit(n, p);

        expect(m).toHaveBeenCalledOnce();
    });

    test('remove cb via `off` and expect it not to be called', () => {
        const m = vi.fn();
        const n = 'test';
        const p = { x: n };

        ps.on(n, m);
        ps.emit(n, p);

        expect(m).toHaveBeenCalledWith(p);

        ps.off(n);
        ps.emit(n, p);

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

        ps.on(n1, m1);
        ps.on(n2, m2);
        ps.on(n3, m3);

        ps.broadcast(p);

        expect(m1).toHaveBeenCalledWith(p);
        expect(m2).toHaveBeenCalledWith(p);
        expect(m3).toHaveBeenCalledWith(p);
    });
});
