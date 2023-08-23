import { Orientation } from '../enums/Orientation';

import { collectionToArray } from '../utils/dom/collectionToArray';
import { getOrientationFromKeyCode } from '../utils/keys';

/** @type { {[index: string]: number[]} } */
const offsetCache = {};

/**
 * @name shouldScroll
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
 * @name findScrollableFromFocusEl
 * @param {HTMLElement} el
 * @param {HTMLElement[]} scrollables
 * @returns {[HTMLElement, number]}
 */
function findScrollableFromFocusEl(el, scrollables) {
    let directChildIndex = scrollables.indexOf(el);
    if (directChildIndex > -1) {
        return [scrollables[directChildIndex], directChildIndex];
    }

    /** @type {HTMLElement} */
    let matched = el; // set to satisfy TypeScript

    for (let i = 0, l = scrollables.length; i < l; i++) {
        const scrollable = scrollables[i];
        if (scrollable.contains(el)) {
            matched = scrollable;
            directChildIndex = i;
            break;
        }
    }

    return [matched, directChildIndex];
}

/**
 * @name calculateOffset
 * @param {number[]} offsets
 * @param {number} scrollableIndex
 * @param {number} startOffset
 */
function calculateOffset(offsets, scrollableIndex, startOffset) {
    return offsets[Math.max(0, scrollableIndex - startOffset)];
}

/**
 * @name scrollAction
 * @param {HTMLElement} el
 * @param {number} keyCode
 * @param {boolean} useTransforms
 * @returns {void}
 */
export function scrollAction(el, keyCode, useTransforms) {
    const scrollEl = getScrollEl(el, keyCode);

    if (scrollEl) {
        // todo: either tell the type system to always expect an id, or generate one for it.
        const scrollId = scrollEl.dataset.deadseaId || '';
        const orientation = scrollEl.dataset.deadseaOrientation;
        const qs = scrollEl.dataset.deadseaChildQuery;
        const startOffset = parseInt(
            scrollEl.dataset.deadseaStartOffset || '',
            10
        );
        const offsetProp =
            orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';
        const scrollables = qs
            ? collectionToArray(document.querySelectorAll(qs))
            : collectionToArray(scrollEl.children);
        const [, scrollableIndex] = findScrollableFromFocusEl(el, scrollables);

        // get all the offsets and cache them against the id of the carousel
        if (!offsetCache[scrollId]) {
            // generate the slot
            offsetCache[scrollId] = [];
            // loop through and add the offsets
            for (let i = 0, l = scrollables.length; i < l; i++) {
                const s = scrollables[i];
                offsetCache[scrollId].push(s[offsetProp]);
            }
        }

        const newOffset = calculateOffset(
            offsetCache[scrollId],
            scrollableIndex,
            startOffset
        );

        if (scrollableIndex >= startOffset) {
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
}
