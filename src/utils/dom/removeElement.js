/**
 * @name removeElement
 * @param {HTMLElement|null} [el]
 * @returns {void}
 */
export function removeElement(el) {
    if (el && el.parentElement) {
        el.parentElement.removeChild(el);
    }
}
