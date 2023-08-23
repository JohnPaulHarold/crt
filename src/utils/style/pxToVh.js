/**
 * Converts a px value to vh
 * @param {number} h
 * @returns {number}
 */
export function pxToVh(h) {
    return (h / window.innerHeight) * 100;
}
