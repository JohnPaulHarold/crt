/**
 * Creates a throttled function that only invokes `callback` at most once per
 * every `time` milliseconds. Each created function has its own independent timer.
 *
 * @param {Function} callback The function to throttle.
 * @param {number} time The number of milliseconds to throttle invocations to.
 * @returns {(...args: any[]) => void} A new throttled function.
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
export function createThrottle(callback, time) {
    /** @type {boolean | undefined} */
    let throttlePause; // This flag is private to each created function's closure.

    return function (...args) {
        if (throttlePause) return;
        throttlePause = true;

        setTimeout(() => {
            // @ts-ignore - `this` is correctly preserved from the calling context of the throttled function.
            callback.apply(this, args);
            throttlePause = false;
        }, time);
    };
}
