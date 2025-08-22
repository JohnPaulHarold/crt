import {
	Orientation,
	collectionToArray,
	$dataGet,
	transformProp,
	loga,
} from 'crt';
import { navigationService } from '../services/navigationService.js';

const logr = loga.create('deadsea');

/** @type {Record<string, number[]>} */
const offsetCache = {};

const focusedQuery = '.focused';

/**
 * @param {HTMLElement} el
 * @returns {HTMLElement=}
 */
function getScrollEl(el) {
	if (!el || !el.parentElement) return;

	if (el.dataset.deadseaOrientation) {
		return el;
	}

	return getScrollEl(el.parentElement);
}

/**
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
 * @param {number[]} offsets
 * @param {number} scrollableIndex
 * @param {number} startOffset
 */
function calculateOffset(offsets, scrollableIndex, startOffset) {
	return offsets[Math.max(0, scrollableIndex - startOffset)];
}

/**
 * @param {HTMLElement} scrollEl
 * @param {boolean} useTransforms
 */
function doTheHardWork(scrollEl, useTransforms) {
	const scrollId = $dataGet(scrollEl, 'deadseaId');
	if (!scrollId) {
		logr.error(
			'DeadSea element requires a "data-deadsea-id" attribute for caching.',
			scrollEl
		);
		return;
	}

	const focusedEl = document.querySelector(focusedQuery);

	const orientation =
		$dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
	const childQuery = $dataGet(scrollEl, 'deadseaChildQuery');
	const startOffset = parseInt(
		$dataGet(scrollEl, 'deadseaStartOffset') || '0',
		10
	);
	const startQs = $dataGet(scrollEl, 'deadseaScrollStartQuery');
	const offsetProp =
		orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';

	// how to do "generics"...
	/** @type {HTMLElement[]} */
	const scrollables = childQuery
		? collectionToArray(scrollEl.querySelectorAll(childQuery))
		: collectionToArray(scrollEl.children);

	if (scrollables.length === 0) {
		return; // Nothing to scroll.
	}

	const scrollableIndex =
		focusedEl instanceof HTMLElement
			? findScrollableFromFocusEl(focusedEl, scrollables)[1]
			: 0;

	const startEl = startQs ? document.querySelector(startQs) : null;
	let startElOffsetInPx = 0;
	if (startEl instanceof HTMLElement) {
		startElOffsetInPx = startEl[offsetProp];
	}

	// get all the offsets and cache them against the id of the carousel
	if (!offsetCache[scrollId]) {
		offsetCache[scrollId] = scrollables.map(
			(s) => /** @type {HTMLElement} */ (s)[offsetProp] - startElOffsetInPx
		);
	}

	const newOffset = calculateOffset(
		offsetCache[scrollId],
		scrollableIndex,
		startOffset
	);

	// Guard against invalid offset (e.g., from empty cache or bad index)
	if (typeof newOffset !== 'number' || !isFinite(newOffset)) {
		return;
	}

	if (scrollableIndex >= startOffset) {
		if (!useTransforms) {
			const axis = orientation === Orientation.HORIZONTAL ? 'left' : 'top';
			scrollEl.style[axis] = -newOffset + 'px';
		} else if (transformProp) {
			const axis = orientation === Orientation.HORIZONTAL ? 'X' : 'Y';
			const style = /** @type {any} */ (scrollEl.style);
			style[transformProp] = `translate${axis}(${-newOffset}px)`;
		}
	} else {
		// Reset scroll position if we are before the start offset
		scrollEl.style.left = '0px';
		scrollEl.style.top = '0px';
		if (transformProp) {
			const style = /** @type {any} */ (scrollEl.style);
			style[transformProp] = '';
		}
	}
}

/**
 * Clears the cached offsets for a given scroll container.
 * Call this when the container is destroyed to prevent memory leaks.
 * @param {string} scrollId The `data-deadsea-id` of the container.
 */
function clearCache(scrollId) {
	delete offsetCache[scrollId];
}

/**
 * @typedef {object} DeadSeaService
 * @property {(el: HTMLElement, useTransforms?: boolean) => void} scrollAction
 * @property {(scrollId: string) => void} clearCache
 * @property {(scrollId: string, direction: 'forward' | 'backward') => void} page
 */

/** @type {DeadSeaService} */
export const deadSeaService = {
	/**
	 * @param {HTMLElement} el
	 * @param {boolean} [useTransforms]
	 */
	scrollAction(el, useTransforms) {
		let scrollEl = getScrollEl(el);

		while (scrollEl) {
			doTheHardWork(scrollEl, !!useTransforms);
			scrollEl =
				scrollEl.parentElement instanceof HTMLElement
					? getScrollEl(scrollEl.parentElement)
					: undefined;
		}
	},

	clearCache: clearCache,

	/**
	 * @param {string} scrollId
	 * @param {'forward' | 'backward'} direction
	 */
	page(scrollId, direction) {
		const scrollEl = document.querySelector(`[data-deadsea-id="${scrollId}"]`);
		if (!scrollEl || !(scrollEl instanceof HTMLElement)) {
			logr.warn(
				`[deadSea.page] Could not find element with data-deadsea-id: ${scrollId}`
			);
			return;
		}

		const orientation =
			$dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
		const isHorizontal = orientation === Orientation.HORIZONTAL;
		const childQuery = $dataGet(scrollEl, 'deadseaChildQuery') || '[id]';
		const items = collectionToArray(scrollEl.querySelectorAll(childQuery));

		if (items.length === 0) return;

		const containerRect = scrollEl.getBoundingClientRect();

		if (direction === 'forward') {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item instanceof HTMLElement) {
					const itemRect = item.getBoundingClientRect();
					if (isHorizontal) {
						if (itemRect.left >= containerRect.right) {
							return navigationService.moveFocus(item);
						}
					} else {
						if (itemRect.top >= containerRect.bottom) {
							return navigationService.moveFocus(item);
						}
					}
				}
			}
		} else {
			// 'backward'
			for (let i = items.length - 1; i >= 0; i--) {
				const item = items[i];
				if (item instanceof HTMLElement) {
					const itemRect = item.getBoundingClientRect();
					if (isHorizontal) {
						if (itemRect.right <= containerRect.left) {
							return navigationService.moveFocus(item);
						}
					} else {
						if (itemRect.bottom <= containerRect.top) {
							return navigationService.moveFocus(item);
						}
					}
				}
			}
		}
	},
};
