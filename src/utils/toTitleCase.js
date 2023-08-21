/**
 * toTitleCase
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(str) {
    if (typeof str !== 'string') {
        return '';
    }

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}
