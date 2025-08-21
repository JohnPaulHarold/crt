/**
 * Creates a debounced function that delays invoking `callback` until after `time`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 * Each created function has its own independent timer.
 *
 * @param {Function} callback The function to debounce.
 * @param {number} time The number of milliseconds to delay.
 * @returns {(...args: any[]) => void} A new debounced function.
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
export function createDebounce(callback, time) {
    /** @type {number | undefined} */
    let timer; // This timer is private to each created function's closure.

    return function (...args) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            // @ts-ignore - `this` is correctly preserved from the calling context of the debounced function.
            callback.apply(this, args);
        }, time);
    };
}
