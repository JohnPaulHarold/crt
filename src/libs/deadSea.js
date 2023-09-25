import { Orientation } from '../models/Orientation';

import { collectionToArray } from '../utils/dom/collectionToArray';
import { $dataGet } from '../utils/dom/$dataGet';
import { transformProp } from '../utils/style/prefix';

/** @type { {[index: string]: number[]} } */
const offsetCache = {};

const focusedQuery = '.focused';

/**
 * @name shouldScroll
 * @param {HTMLElement} el
 * @returns {HTMLElement | undefined}
 */
function getScrollEl(el) {
    if (!el || !el.parentElement) return;

    if (el.dataset.deadseaOrientation) {
        return el;
    }

    return getScrollEl(el.parentElement);
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
 * @name doTheHardWork
 * @param {HTMLElement} scrollEl
 * @param {boolean} useTransforms
 */
function doTheHardWork(scrollEl, useTransforms) {
    // todo: either tell the type system to always expect an id, or generate one for it.
    const focusedEl = document.querySelector(focusedQuery);

    const scrollId = $dataGet(scrollEl, 'deadseaId') || '';
    const orientation = $dataGet(scrollEl, 'deadseaOrientation');
    const qs = $dataGet(scrollEl, 'deadseaChildQuery') || '';
    const startOffset = $dataGet(scrollEl, 'deadseaStartOffset') || 0;
    const startQs = $dataGet(scrollEl, 'deadseaScrollStartQuery') || '';
    const offsetProp =
        orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';
    const scrollables =
        qs && typeof qs === 'string'
            ? collectionToArray(document.querySelectorAll(qs))
            : collectionToArray(scrollEl.children);
    const scrollableIndex =
        focusedEl instanceof HTMLElement
            ? findScrollableFromFocusEl(focusedEl, scrollables)[1]
            : 0;

    const startEl =
        startQs &&
        typeof startQs === 'string' &&
        document.querySelector(startQs);
    let startElOffsetInPx = 0;
    if (startEl instanceof HTMLElement) {
        startElOffsetInPx = startEl[offsetProp];
    }

    // get all the offsets and cache them against the id of the carousel
    if (!offsetCache[scrollId]) {
        // generate the slot
        offsetCache[scrollId] = [];
        // loop through and add the offsets
        for (let i = 0, l = scrollables.length; i < l; i++) {
            const s = scrollables[i];
            const value = s[offsetProp] - startElOffsetInPx;
            offsetCache[scrollId].push(value);
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
            scrollEl.style.setProperty(transformProp, 'translate' + axis + '(' + -newOffset + 'px) ');
        }
    }
}

/**
 * @name scrollAction
 * @param {HTMLElement} el
 * @param {boolean} useTransforms
 * @returns {void}
 */
export function scrollAction(el, useTransforms) {
    let scrollEl = getScrollEl(el);

    while (scrollEl) {
        doTheHardWork(scrollEl, useTransforms);
        scrollEl =
            scrollEl.parentElement instanceof HTMLElement
                ? getScrollEl(scrollEl.parentElement)
                : undefined;
    }
}
