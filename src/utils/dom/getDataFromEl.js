/**
 *
 * @param {HTMLElement} el
 * @param {string} dataProp
 * @returns {*}
 */
export function getDataFromEl(el, dataProp) {
    const value = el.dataset && el.dataset[dataProp];

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }

    return '';
}
