import { noop } from 'crt';

export type HandleFullCallback<T> = (data: T[]) => void;

export interface BatchedQueueInstance<T> {
	enqueue: (element: T, priority?: number) => void;
	sweep: () => void;
	clearSweep: () => void;
	flush: () => void;
	length: () => number;
	isEmpty: () => boolean;
	getFront: () => T | undefined;
	getLast: () => T | undefined;
	dequeue: () => T | undefined;
	clear: (len: number) => void;
	_getInternalStateForTesting?: () => { data: { item: T; priority: number; }[]; size: number; batchInterval: number; handleFull: HandleFullCallback<T>; } | undefined;
}

/**
 * Creates a queue that processes items in batches. Batches are processed automatically
 * when the queue reaches its size limit, or after a specified time interval.
 *
 * This utility is useful for collecting a series of events (e.g., analytics, logs, notifications)
 * and handling them together to reduce overhead, rather than processing each one individually.
 *
 * ### Priority Queueing
 * The `enqueue` method accepts an optional `priority` number (lower is higher).
 * This allows critical items (e.g., error logs) to be placed at the front of the
 * queue, ensuring they are processed in the next batch.
 *
 * ### Manual Flushing
 * The `flush` method allows for explicit, synchronous processing of all items
 * currently in the queue. This is useful for ensuring no data is lost during
 * critical state transitions, such as when a view is being destroyed or the
 * application is closing.
 *
 * @param handleFull The callback function to execute when the queue is full or flushed.
 * @param batchInterval The time in milliseconds to wait before automatically processing the queue.
 * @param size The maximum number of items the queue can hold before being processed.
 */
export function createBatchedQueue<T>(handleFull: HandleFullCallback<T>, batchInterval?: number, size?: number): BatchedQueueInstance<T> {
	const defaultSize = 10;
	const defaultBatchInterval = 5e3;

	let data: { item: T; priority: number; }[] = [];
	const queueSize = size || defaultSize;
	const onFull = handleFull || noop;
	let timer: number | null | NodeJS.Timeout = null;
	const interval = batchInterval || defaultBatchInterval;

	const publicApi: BatchedQueueInstance<T> = {
		enqueue(element, priority = 10) {
			publicApi.clearSweep();

			const newItem = { item: element, priority };

			// Find the correct position to insert the new item based on priority.
			// A lower number indicates a higher priority.
			const index = data.findIndex(
				(existing) => existing.priority > newItem.priority
			);

			if (index === -1) {
				// If no item has a lower priority, add to the end.
				data.push(newItem);
			} else {
				// Otherwise, insert before the first item with a lower priority.
				data.splice(index, 0, newItem);
			}

			// If the queue is now full, process it immediately.
			if (data.length >= queueSize) {
				const batch = data.map((d) => d.item);
				onFull(batch);
				publicApi.clear(batch.length);
			} else {
				// Otherwise, if the queue is not full, set a timer for the next sweep.
				publicApi.sweep();
			}
		},

		sweep() {
			timer = setTimeout(() => {
				const batch = data.map((d) => d.item);
				if (batch.length > 0) {
					onFull(batch);
					publicApi.clear(batch.length);
				}
			}, interval);
		},

		clearSweep() {
			if (timer) window.clearTimeout(timer);
			timer = null;
		},

		flush() {
			this.clearSweep();
			if (data.length > 0) {
				const batch = data.map((d) => d.item);
				onFull(batch);
				this.clear(batch.length);
			}
		},

		length() {
			return data.length;
		},

		isEmpty() {
			return data.length === 0;
		},

		getFront() {
			if (!publicApi.isEmpty()) {
				return data[0].item;
			}
		},

		getLast() {
			if (!publicApi.isEmpty()) {
				return data[data.length - 1].item;
			}
		},

		dequeue() {
			if (!publicApi.isEmpty()) {
				return data.shift()?.item;
			}
		},

		clear(len) {
			data = data.slice(len);
		},

		// Expose internal state for testing purposes only
		_getInternalStateForTesting:
			process.env.NODE_ENV === 'test'
				? () => ({
						data,
						size: queueSize,
						batchInterval: interval,
						handleFull: onFull,
					})
				: undefined,
	};

	return publicApi;
}
