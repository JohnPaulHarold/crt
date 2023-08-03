let currentListener = undefined;

/**
 * @template T
 * @param {T} initialValue
 * @returns {[function, function]}
 */
export function createSignal(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    /**
     *
     * @returns {T}
     */
    const read = () => {
        if (currentListener !== undefined) {
            subscribers.add(currentListener);
        }
        return value;
    };

    const write = (newValue) => {
        value = newValue;
        subscribers.forEach((fn) => fn());
    };

    return [read, write];
}

/**
 * @param {function} callback
 */
export function createEffect(callback) {
    currentListener = callback;
    callback();
    currentListener = undefined;
}
