import { noop } from 'crt';

/**
 * @template T
 * @callback HandleFullCallback
 * @param {T[]} data
 */

/**
 * @template T
 * @typedef {object} BatchedQueueInstance
 * @property {(element: T, priority?: number) => void} enqueue
 * @property {() => void} sweep
 * @property {() => void} clearSweep
 * @property {() => void} flush
 * @property {() => number} length
 * @property {() => boolean} isEmpty
 * @property {() => T | undefined} getFront
 * @property {() => T | undefined} getLast
 * @property {() => T | undefined} dequeue
 * @property {(len: number) => void} clear
 * @property {() => { data: { item: T, priority: number }[], size: number, batchInterval: number, handleFull: HandleFullCallback<T> } | undefined} [_getInternalStateForTesting]
 */

/**
 * @template T
 * @param {HandleFullCallback<T>} handleFull
 * @param {number} [batchInterval]
 * @param {number} [size]
 * @returns {BatchedQueueInstance<T>}
 */
export function createBatchedQueue(handleFull, batchInterval, size) {
	const defaultSize = 10;
	const defaultBatchInterval = 5e3;

	/** @type {{ item: T, priority: number }[]} */
	let data = [];
	const queueSize = size || defaultSize;
	const onFull = handleFull || noop;
	/** @type {number | null} */
	let timer = null;
	const interval = batchInterval || defaultBatchInterval;

	/** @type {BatchedQueueInstance<T>} */
	const publicApi = {
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
			timer = window.setTimeout(() => {
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
