import { Orientation } from '../enums/Orientation';

import { collectionToArray } from '../utils/collectionToArray';
import { getElementChain } from '../utils/getElementChain';
import { getIntersection } from '../utils/getIntersection';
import { getOrientationFromKeyCode } from '../utils/keys';

/**
 * shouldScroll
 * @param {HTMLElement} el
 * @param {number} keyCode
 * @returns {HTMLElement | undefined}
 */
function getScrollEl(el, keyCode) {
    if (!el || !el.parentElement) return;

    const orientation = getOrientationFromKeyCode(keyCode);

    if (el.dataset.deadseaOrientation === orientation) {
        return el;
    }

    return getScrollEl(el.parentElement, keyCode);
}

/**
 *
 * @param {Array<Element|ParentNode|Node>} elementArray
 * @returns {number}
 */
function getActiveChild(elementArray) {
    let currentIndex = -1;

    if (!document.activeElement) {
        return currentIndex;
    }

    currentIndex = elementArray.indexOf(document.activeElement);

    // if the activeElement is a direct child, just return that
    if (currentIndex > -1) {
        return currentIndex;
    }

    const elChain = getElementChain(document.activeElement);
    const intersection = getIntersection(elChain, elementArray);

    if (intersection.length > 0) {
        const el = intersection[0];
        return elementArray.indexOf(el);
    }

    return currentIndex;
}

/**
 * findScrollableFromFocusEl
 * @param {HTMLElement} el
 * @param {HTMLElement[]} scrollables
 * @returns {HTMLElement}
 */
function findScrollableFromFocusEl(el, scrollables) {
    const directChildIndex = scrollables.indexOf(el);
    if (directChildIndex > -1) {
        return scrollables[directChildIndex];
    }

    /** @type {HTMLElement} */
    let matched = el; // set to satisfy TypeScript

    for (let i = 0, l = scrollables.length; i < l; i++) {
        const scrollable = scrollables[i];
        if (scrollable.contains(el)) {
            matched = scrollable;
            break;
        }
    }

    return matched;
}

/**
 * scrollAction
 * @param {HTMLElement} el
 * @param {number} keyCode
 * @param {boolean} useTransforms
 * @returns {void}
 */
export function scrollAction(el, keyCode, useTransforms) {
    const scrollEl = getScrollEl(el, keyCode);

    if (scrollEl) {
        const orientation = scrollEl.dataset.deadseaOrientation;
        const qs = scrollEl.dataset.deadseaChildQuery;
        const offsetProp =
            orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';
        const scrollables = qs
            ? collectionToArray(document.querySelectorAll(qs))
            : collectionToArray(scrollEl.children);
        const scrollable = findScrollableFromFocusEl(el, scrollables);
        const newOffset = scrollable[offsetProp];

        if (!useTransforms) {
            const axis =
                orientation === Orientation.HORIZONTAL ? 'left' : 'top';
            scrollEl.style[axis] = -newOffset + 'px';
        } else {
            const axis = orientation === Orientation.HORIZONTAL ? 'X' : 'Y';
            scrollEl.style.transform =
                'translate' + axis + '(' + -newOffset + 'px) ';
        }
    }
}
