/**
 * @vitest-environment jsdom
 */

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

		pubSub.off(n, m);
		pubSub.emit(n, p);

		expect(m).toHaveBeenCalledTimes(1);
	});

	test('`off` without a callback should remove all listeners for an event', () => {
		const m1 = vi.fn();
		const m2 = vi.fn();
		const n = 'test';

		pubSub.on(n, m1);
		pubSub.on(n, m2);

		pubSub.off(n); // No callback, should remove all
		pubSub.emit(n, {});

		expect(m1).not.toHaveBeenCalled();
		expect(m2).not.toHaveBeenCalled();
	});

	test('`once` should only remove itself, not other listeners for the same event', () => {
		const onceCb = vi.fn();
		const onCb = vi.fn();
		const n = 'test';
		pubSub.once(n, onceCb);
		pubSub.on(n, onCb);
		pubSub.emit(n, {}); // First emit
		expect(onceCb).toHaveBeenCalledTimes(1);
		expect(onCb).toHaveBeenCalledTimes(1);
		pubSub.emit(n, {}); // Second emit
		expect(onceCb).toHaveBeenCalledTimes(1); // Should not be called again
		expect(onCb).toHaveBeenCalledTimes(2); // Should be called again
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
