/**
 *
 * @param {HTMLElement} el
 * @param {string} dataProp
 */
export function getDataFromEl(el, dataProp) {
    if (el.dataset && el.dataset[dataProp]) {
        return el.dataset[dataProp];
    }

    return false;
}
