/**
 *
 * @param {HTMLElement} el
 * @param {string} dataProp
 * @param {string|boolean|number|object} value
 */
export function $dataSet(el, dataProp, value) {
    if (!el || !dataProp || value === undefined || value === null) {
        // return an error?
        return '';
    }
    // probably only need to call JSON.stringify
    // if the value is complex
    const type = typeof value;

    if (type === "string") {
        el.dataset[dataProp] = value + "";
    } else {
        el.dataset[dataProp] = JSON.stringify(value);
    }

}
