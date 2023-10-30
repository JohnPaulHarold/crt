/**
 * @name removeElement
 * @param {HTMLElement|Element} el
 * @returns {void}
 */
export function removeElement(el) {
    if (el.parentElement) {
        el.parentElement.removeChild(el);
    }
}
