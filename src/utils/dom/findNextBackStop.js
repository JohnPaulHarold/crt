import { $dataGet } from './$dataGet';

/**
 * @name findNextBackStop
 * @param {HTMLElement|null} el
 * @returns {HTMLElement=}
 */
export function findNextBackStop(el) {
    if (!el) {
        return;
    }

    if ($dataGet(el, 'backStop')) {
        const firstChild = el.children[0];
        if (firstChild.classList.contains('focused') ||
            firstChild.querySelector('.focused')) {
            return findNextBackStop(el.parentElement);
        }
        return el;
    }

    return findNextBackStop(el.parentElement);
}
