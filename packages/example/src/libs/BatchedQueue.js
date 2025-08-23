import { noop } from 'crt';

/**
 * @template T
 * @callback HandleFullCallback
 * @param {T[]} data
 */

/**
 * @template T
 * @typedef {object} BatchedQueueInstance
 * @property {(element: T) => void} enqueue
 * @property {() => void} sweep
 * @property {() => void} clearSweep
 * @property {() => number} length
 * @property {() => boolean} isEmpty
 * @property {() => T | undefined} getFront
 * @property {() => T | undefined} getLast
 * @property {() => T | undefined} dequeue
 * @property {(len: number) => void} clear
 * @property {() => { data: T[], size: number, batchInterval: number, handleFull: HandleFullCallback<T> } | undefined} [_getInternalStateForTesting]
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

	/** @type {T[]} */
	let data = [];
	const queueSize = size || defaultSize;
	const onFull = handleFull || noop;
	/** @type {number | null} */
	let timer = null;
	const interval = batchInterval || defaultBatchInterval;

	/** @type {BatchedQueueInstance<T>} */
	const publicApi = {
		enqueue(element) {
			publicApi.clearSweep();
			data.push(element);

			// If the queue is now full, process it immediately.
			if (data.length >= queueSize) {
				const batch = [...data];
				onFull(batch);
				publicApi.clear(batch.length);
			} else {
				// Otherwise, if the queue is not full, set a timer for the next sweep.
				publicApi.sweep();
			}
		},

		sweep() {
			timer = window.setTimeout(() => {
				const batch = [...data];
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

		length() {
			return data.length;
		},

		isEmpty() {
			return data.length === 0;
		},

		getFront() {
			if (!publicApi.isEmpty()) {
				return data[0];
			}
		},

		getLast() {
			if (!publicApi.isEmpty()) {
				return data[data.length - 1];
			}
		},

		dequeue() {
			if (!publicApi.isEmpty()) {
				return data.shift();
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
