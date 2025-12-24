import type { ReadonlySignaler } from '../../types.js';

/**
 * Watches an array of signallers and calls a handler when any of them change.
 * Batches multiple changes within a single event loop tick into one handler call.
 * @param signallers
 * @param handler
 * @returns A function to stop watching.
 */
export function watch<T extends readonly ReadonlySignaler<unknown>[]>(
	signallers: [...T],
	handler: (changedSignallers: Array<T[number]>) => void
): () => void {
	let isScheduled = false;
	let changed: Array<T[number]> = [];

	// This callback is designed to handle the union of all possible signaller types
	// passed into the watch function.
	const callback = (signaller: T[number]) => {
		if (changed.indexOf(signaller) === -1) {
			changed.push(signaller);
		}
		if (!isScheduled) {
			isScheduled = true;
			// Use setTimeout to batch all changes that occur in the same tick.
			setTimeout(wake, 0);
		}
	};

	const wake = () => {
		const signalsToProcess = changed;
		changed = [];
		isScheduled = false;
		handler(signalsToProcess);
	};

	signallers.forEach((s) => {
		// higher-order functions on heterogeneous arrays (unions of function types).
		// The `wait` method on each signaller expects a callback specific to its own type
		// (e.g., `(instance: ReadonlySignaler<string>) => void`), but our `callback` is a
		// more generic `(instance: ReadonlySignaler<string> | ReadonlySignaler<number>) => void`.
		// This is safe because the callback only uses properties common to all signallers.
		s.wait(callback);
	});

	/**
	 * The function returned to the caller to stop watching.
	 */
	return () =>
		signallers.forEach((s) => {
			s.unwait(callback);
		});
}
