/**
 * Creates a throttled function that only invokes `callback` at most once per
 * every `time` milliseconds. Each created function has its own independent timer.
 *
 * @param callback The function to throttle.
 * @param time The number of milliseconds to throttle invocations to.
 * @returns A new throttled function.
 * @example
 * // Create a throttled function to handle rapid key presses.
 * const handleKeyDown = createThrottle((event) => {
 *   console.log('Key pressed:', event.key);
 * }, 100);
 *
 * // Attach it to the event listener.
 * // The console.log will fire at most once every 100ms, no matter how
 * // fast the user presses keys.
 * window.addEventListener('keydown', handleKeyDown);
 */
export function createThrottle<T extends (...args: unknown[]) => unknown>(
	callback: T,
	time: number
): (...args: Parameters<T>) => void {
	let throttlePause: boolean | undefined; // This flag is private to each created function's closure.

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		if (throttlePause) return;
		throttlePause = true;

		setTimeout(() => {
			callback.apply(this, args);
			throttlePause = false;
		}, time);
	};
}
