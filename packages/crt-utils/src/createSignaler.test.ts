/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { createSignaler } from './createSignaler.js';

describe('createSignaler', () => {
	test('should initialize with a value and return it with getValue', () => {
		const initial = 'hello';
		const s = createSignaler(initial);
		expect(s.getValue()).toBe(initial);
	});

	test('setValue should update the value', () => {
		const s = createSignaler('one');
		s.setValue('two');
		expect(s.getValue()).toBe('two');
	});

	test('setValue should call waiting callbacks when the value changes', () => {
		const callback = vi.fn();
		const s = createSignaler(1);
		s.wait(callback);
		s.setValue(2);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(s);
	});

	test('setValue should not call waiting callbacks if the value is the same', () => {
		const callback = vi.fn();
		const s = createSignaler(1);
		s.wait(callback);
		s.setValue(1);
		expect(callback).not.toHaveBeenCalled();
	});

	test('unwait should remove a callback', () => {
		const callback = vi.fn();
		const s = createSignaler(1);
		s.wait(callback);
		s.unwait(callback);
		s.setValue(2);
		expect(callback).not.toHaveBeenCalled();
	});

	test('unwait should do nothing if callback is not registered', () => {
		const callback1 = vi.fn();
		const callback2 = vi.fn();
		const s = createSignaler(1);
		s.wait(callback1);

		// Attempt to unwait a callback that was never added
		expect(() => s.unwait(callback2)).not.toThrow();

		s.setValue(2);
		expect(callback1).toHaveBeenCalledTimes(1);
		expect(callback2).not.toHaveBeenCalled();
	});

	test('multiple waiters should all be called', () => {
		const cb1 = vi.fn();
		const cb2 = vi.fn();
		const s = createSignaler(0);
		s.wait(cb1);
		s.wait(cb2);
		s.setValue(1);
		expect(cb1).toHaveBeenCalledTimes(1);
		expect(cb2).toHaveBeenCalledTimes(1);
	});
});
