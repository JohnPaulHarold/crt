/** @type {number} */
let debounceTimer;

/**
 *
 * @param {Function} callback
 * @param {number} time
 */
export const debounce = (callback, time) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
};
