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
    const orientation = el.dataset.deadseaOrientation;
    const arrowsForId = $dataGet(el, 'deadseaArrowsForId');
    const sliderElForArrows = document.querySelector(
        "[data-deadsea-id='" + arrowsForId + "']"
    );

    if (sliderElForArrows instanceof HTMLElement) {
        return sliderElForArrows;
    }

    if (orientation) {
        return el;
    }

    return getScrollEl(el.parentElement);
}

/**
 * @name findScrollableFromFocusEl
 * @param {HTMLElement} el
 * @param {HTMLElement[]} scrollableItems
 * @param {object} [incrementObject]
 * @param {number} [incrementObject.increment]
 * @param {string} [incrementObject.forId]
 * @returns {{el: HTMLElement | null, index: number}}
 */
function findScrollableItemUsingFocusEl(el, scrollableItems, incrementObject) {
    let increment = (incrementObject && incrementObject.increment) || 0;
    let directChildIndex = scrollableItems.indexOf(el);

    if (directChildIndex > -1) {
        return {
            el: scrollableItems[directChildIndex + increment],
            index: directChildIndex + increment,
        };
    }

    /** @type {HTMLElement} */
    let matched = el; // set to satisfy TypeScript

    for (let i = 0, l = scrollableItems.length; i < l; i++) {
        const scrollable = scrollableItems[i];
        if (scrollable.contains(el)) {
            matched = scrollable;
            directChildIndex = i;
            if (
                incrementObject &&
                scrollable.dataset.deadseaArrowsForId === incrementObject.forId
            ) {
                directChildIndex + increment;
            }
            break;
        }
    }

    return {
        el: matched,
        index: directChildIndex,
    };
}

/**
 * @name calculateOffset
 * @param {number[]} offsets
 * @param {number} scrollableItemIndex
 * @param {number} startOffset
 */
function calculateOffset(offsets, scrollableItemIndex, startOffset) {
    return offsets[Math.max(0, scrollableItemIndex - startOffset)];
}

/**
 * @name doTheHardWork
 * @param {HTMLElement} scrollEl
 * @param {boolean} useTransforms
 * @param {object} [incrementObject]
 */
function doTheHardWork(scrollEl, useTransforms, incrementObject) {
    // todo: either tell the type system to always expect an id, or generate one for it.
    const focusedEl = document.querySelector(focusedQuery);

    // get various data attributes from the carousel element
    const scrollId = $dataGet(scrollEl, 'deadseaId') || '';
    const orientation = $dataGet(scrollEl, 'deadseaOrientation');
    const qs = $dataGet(scrollEl, 'deadseaChildQuery') || '';
    const startOffset = $dataGet(scrollEl, 'deadseaStartOffset') || 0;
    const startQs = $dataGet(scrollEl, 'deadseaScrollStartQuery') || '';

    const offsetProp =
        orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';

    // if we have used the childQuery data attr, then we will use that
    // to workout the list of scrollable items
    // else we assume it's a the direct children of the scroller
    // this allows us to have variable sized items, or different items,
    // or items we don't wish to add to our calculations.
    const scrollableItems =
        qs && typeof qs === 'string'
            ? collectionToArray(document.querySelectorAll(qs))
            : collectionToArray(scrollEl.children);
    const nextScrollableItem =
        focusedEl instanceof HTMLElement
            ? findScrollableItemUsingFocusEl(
                  focusedEl,
                  scrollableItems,
                  incrementObject
              )
            : { el: null, index: 0 };

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
        for (let i = 0, l = scrollableItems.length; i < l; i++) {
            const s = scrollableItems[i];
            const value = s[offsetProp] - startElOffsetInPx;
            offsetCache[scrollId].push(value);
        }
    }

    const newOffset = calculateOffset(
        offsetCache[scrollId],
        nextScrollableItem.index,
        startOffset
    );

    if (nextScrollableItem.index >= startOffset) {
        if (!useTransforms) {
            const axis =
                orientation === Orientation.HORIZONTAL ? 'left' : 'top';
            scrollEl.style[axis] = -newOffset + 'px';
        } else {
            const axis = orientation === Orientation.HORIZONTAL ? 'X' : 'Y';
            // @ts-ignore
            scrollEl.style[transformProp] =
                'translate' + axis + '(' + -newOffset + 'px)';
        }
    }
}

/**
 * @name scrollAction
 * @param {HTMLElement} nextEl the element we are wanting to scroll to
 * @param {boolean} useTransforms whether to use CSS transforms or not
 * @param {object} [incrementObject]
 * @returns {void}
 */
export function scrollAction(nextEl, useTransforms, incrementObject) {
    let scrollEl = getScrollEl(nextEl);

    while (scrollEl) {
        doTheHardWork(scrollEl, useTransforms, incrementObject);
        scrollEl =
            scrollEl.parentElement instanceof HTMLElement
                ? getScrollEl(scrollEl.parentElement)
                : undefined;
    }
}
