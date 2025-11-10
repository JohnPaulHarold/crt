/**
 * Creates a debounced function that delays invoking `callback` until after `time`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 * Each created function has its own independent timer.
 *
 * @param callback The function to debounce.
 * @param time The number of milliseconds to delay.
 * @returns A new debounced function.
 * @example
 * // Create a debounced function to handle window resizing.
 * const handleResize = createDebounce(() => {
 *   console.log('Window resized to:', window.innerWidth);
 * }, 250);
 *
 * // Attach it to the event listener.
 * // The console.log will only fire 250ms after the user stops resizing.
 * window.addEventListener('resize', handleResize);
 */
export function createDebounce<T extends (...args: unknown[]) => unknown>(
	callback: T,
	time: number
): (...args: Parameters<T>) => void {
	/**
	 * The timer ID. This can be a number (browser) or a Timeout object (Node.js).
	 */
	let timer: number | NodeJS.Timeout | undefined; // This timer is private to each created function's closure.

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			callback.apply(this, args);
		}, time);
	};
}
