/**
 * @param {HTMLElement} el
 * @param {string} dataProp
 * @returns {*}
 */
export function $dataGet(el, dataProp) {
    const value = el.dataset && el.dataset[dataProp];

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            return value;
        }
    }

    return '';
}
