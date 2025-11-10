/**
 * @vitest-environment jsdom
 */
import type { BatchedQueueInstance} from './BatchedQueue.js';

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBatchedQueue } from './BatchedQueue.js';

/**
 * A test helper to safely access the internal state of a BatchedQueue instance.
 * This encapsulates the check for the existence of the test-only method.
 */
function getQueueState(queue: BatchedQueueInstance<any>) {
	if (typeof queue._getInternalStateForTesting !== 'function') {
		throw new Error(
			'The _getInternalStateForTesting helper method is not available on this queue instance.'
		);
	}
	const state = queue._getInternalStateForTesting();
	if (!state) {
		throw new Error(
			'The _getInternalStateForTesting helper returned no state.'
		);
	}
	return state;
}

describe('BatchedQueue', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	test('should initialize with default values', () => {
		const handleFull = vi.fn();
		const queue = createBatchedQueue(handleFull);
		const state = getQueueState(queue);
		expect(state.size).toBe(10);
		expect(state.batchInterval).toBe(5000);
		expect(state.data).toEqual([]);
		expect(state.handleFull).toBe(handleFull);
	});

	test('should initialize with provided values', () => {
		const handleFull = vi.fn();
		const queue = createBatchedQueue(handleFull, 1000, 5);
		const state = getQueueState(queue);
		expect(state.size).toBe(5);
		expect(state.batchInterval).toBe(1000);
	});

	test('enqueue should add items to the queue', () => {
		const queue: BatchedQueueInstance<number> =
				createBatchedQueue(vi.fn(), 1000, 5);
		queue.enqueue(1);
		queue.enqueue(2);

		expect(queue.length()).toBe(2);
		expect(getQueueState(queue).data.map((d) => d.item)).toEqual([1, 2]);
	});

	test('enqueue should trigger handleFull when queue reaches size limit', () => {
		const handleFull = vi.fn();
		const queue: BatchedQueueInstance<number> =
				createBatchedQueue(handleFull, 1000, 3);

		queue.enqueue(1);
		queue.enqueue(2);
		expect(handleFull).not.toHaveBeenCalled();

		// This enqueue call should make the queue full and trigger the handler
		queue.enqueue(3);

		expect(handleFull).toHaveBeenCalledTimes(1);
		expect(handleFull).toHaveBeenCalledWith([1, 2, 3]);

		// The queue should be empty after being handled
		expect(queue.length()).toBe(0);
		expect(queue.isEmpty()).toBe(true);
	});

	test('sweep should trigger handleFull after batchInterval', () => {
		const handleFull = vi.fn();
		const queue: BatchedQueueInstance<number> =
				createBatchedQueue(handleFull, 1000, 5);

		queue.enqueue(1);
		queue.enqueue(2);

		// Advance time, but not enough to trigger the sweep
		vi.advanceTimersByTime(999);
		expect(handleFull).not.toHaveBeenCalled();

		// Advance time past the interval
		vi.advanceTimersByTime(1);
		expect(handleFull).toHaveBeenCalledTimes(1);
		expect(handleFull).toHaveBeenCalledWith([1, 2]);

		// The queue should be empty after the sweep
		expect(queue.isEmpty()).toBe(true);
	});

	test('enqueue should reset the sweep timer', () => {
		const handleFull = vi.fn();
		const queue: BatchedQueueInstance<number> =
				createBatchedQueue(handleFull, 1000, 5);

		queue.enqueue(1); // Timer starts
		vi.advanceTimersByTime(500);

		queue.enqueue(2); // Timer should reset
		vi.advanceTimersByTime(500);

		// 1000ms have passed since the first enqueue, but only 500ms since the second.
		// The handler should not have been called.
		expect(handleFull).not.toHaveBeenCalled();

		// Advance time to trigger the reset timer
		vi.advanceTimersByTime(500);
		expect(handleFull).toHaveBeenCalledTimes(1);
		expect(handleFull).toHaveBeenCalledWith([1, 2]);
	});

	test('clearSweep should cancel the pending sweep', () => {
		const handleFull = vi.fn();
		const queue: BatchedQueueInstance<number> =
				createBatchedQueue(handleFull, 1000, 5);

		queue.enqueue(1);
		queue.clearSweep();

		// Advance time well past the interval
		vi.advanceTimersByTime(2000);

		expect(handleFull).not.toHaveBeenCalled();
	});

	test('enqueue should order items by priority', () => {
		const queue: BatchedQueueInstance<string> =
				createBatchedQueue(vi.fn(), 1000, 10);

		queue.enqueue('low_priority', 20);
		queue.enqueue('high_priority', 1);
		queue.enqueue('medium_priority', 10);
		queue.enqueue('another_high_priority', 1);

		const state = getQueueState(queue);
		const items = state.data.map((d) => d.item);

		expect(items).toEqual([
			'high_priority',
			'another_high_priority',
			'medium_priority',
			'low_priority',
		]);
	});

	test('flush should manually process the queue and clear it', () => {
		const handleFull = vi.fn();
		const queue: BatchedQueueInstance<number> =
				createBatchedQueue(handleFull, 5000, 10);

		queue.enqueue(1);
		queue.enqueue(2);
		queue.enqueue(3);

		expect(handleFull).not.toHaveBeenCalled();

		queue.flush();

		expect(handleFull).toHaveBeenCalledTimes(1);
		expect(handleFull).toHaveBeenCalledWith([1, 2, 3]);
		expect(queue.isEmpty()).toBe(true);
	});

	test('flush on an empty queue should do nothing', () => {
		const handleFull = vi.fn();
		const queue = createBatchedQueue(handleFull, 5000, 10);

		expect(() => queue.flush()).not.toThrow();
		expect(handleFull).not.toHaveBeenCalled();
	});

	test('utility methods should work correctly', () => {
		const queue: BatchedQueueInstance<string> =
				createBatchedQueue(vi.fn(), 1000, 5);

		expect(queue.isEmpty()).toBe(true);

		queue.enqueue('a');
		queue.enqueue('b');

		expect(queue.isEmpty()).toBe(false);
		expect(queue.length()).toBe(2);
		expect(queue.getFront()).toBe('a');
		expect(queue.getLast()).toBe('b');

		const dequeued = queue.dequeue();
		expect(dequeued).toBe('a');
		expect(queue.length()).toBe(1);
		expect(queue.getFront()).toBe('b');

		queue.enqueue('c');
		queue.enqueue('d');
		// queue is now ['b', 'c', 'd']
		queue.clear(2);
		expect(getQueueState(queue).data.map((d) => d.item)).toEqual(['d']);
	});
});
