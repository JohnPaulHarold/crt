import {
	Orientation,
	collectionToArray,
	$dataGet,
	transformProp,
	loga,
} from 'crt';

const logr = loga.create('deadsea');

/**
 * A cache to store pre-calculated geometry for each registered carousel.
 * @type {Record<string, { offsets: number[], scrollables: HTMLElement[] }>}
 */
const geometryCache = {};

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
 * Gets the geometry from the cache for a given scroll element.
 * This function assumes the geometry has already been registered.
 *
 * @param {HTMLElement} scrollEl The scrollable container element.
 * @returns {{ offsets: number[], scrollables: HTMLElement[] } | null} The cached geometry or null if not found.
 */
function getCachedGeometry(scrollEl) {
	const scrollId = $dataGet(scrollEl, 'deadseaId');
	if (!scrollId) {
		logr.error(
			'DeadSea element requires a "data-deadsea-id" attribute for caching.',
			scrollEl
		);
		return null;
	}

	if (!geometryCache[scrollId]) {
		logr.warn(
			`[deadSea] Geometry for scrollId "${scrollId}" not found in cache. Was it registered?`
		);
		return null;
	}

	return geometryCache[scrollId];
}

/**
 * Builds the geometry for a scrollable element.
 * @param {HTMLElement} scrollEl
 * @returns {{ offsets: number[], scrollables: HTMLElement[] } | null}
 */
function buildGeometry(scrollEl) {
	const orientation =
		$dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
	const childQuery = $dataGet(scrollEl, 'deadseaChildQuery');
	const startQs = $dataGet(scrollEl, 'deadseaScrollStartQuery');
	const offsetProp =
		orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';

	const scrollables = childQuery
		? collectionToArray(scrollEl.querySelectorAll(childQuery))
		: collectionToArray(scrollEl.children);

	if (scrollables.length === 0) return null;

	const startEl = startQs ? document.querySelector(startQs) : null;
	let startElOffsetInPx = 0;
	if (startEl instanceof HTMLElement) {
		startElOffsetInPx = startEl[offsetProp];
	}

	const offsets = scrollables.map((s) => s[offsetProp] - startElOffsetInPx);
	return { offsets, scrollables };
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
	const geometry = getCachedGeometry(scrollEl);
	if (!geometry) {
		return;
	}

	const { offsets, scrollables } = geometry;
	const focusedEl = document.querySelector(focusedQuery);

	const orientation =
		$dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
	const startOffset = parseInt(
		$dataGet(scrollEl, 'deadseaStartOffset') || '0',
		10
	);

	const scrollableIndex =
		focusedEl instanceof HTMLElement
			? findScrollableFromFocusEl(focusedEl, scrollables)[1]
			: 0;

	const newOffset = calculateOffset(offsets, scrollableIndex, startOffset);

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
 * @typedef {object} DeadSeaService
 * @property {(el: HTMLElement, useTransforms?: boolean) => void} scrollAction
 * @property {(scrollEl: HTMLElement) => void} register - Registers a carousel and builds its geometry cache.
 * @property {(scrollId: string) => void} unregister - Removes a carousel from the cache.
 * @property {() => void} unregisterAll - Clears all cached geometries.
 * @property {(scrollId: string, direction: 'forward' | 'backward') => HTMLElement | undefined} page
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

	/**
	 * Registers a scrollable element with the service, building and caching its geometry.
	 * @param {HTMLElement} scrollEl The scrollable element (the one with `data-deadsea-id`).
	 */
	register(scrollEl) {
		const scrollId = $dataGet(scrollEl, 'deadseaId');
		if (!scrollId) {
			logr.error(
				'[deadSea.register] Cannot register an element without a "data-deadsea-id".',
				scrollEl
			);
			return;
		}
		logr.info(
			`[deadSea] Registering and building cache for scrollId: "${scrollId}"`
		);
		const geometry = buildGeometry(scrollEl);
		if (geometry) {
			geometryCache[scrollId] = geometry;
		}
	},

	/**
	 * Removes a scrollable element's geometry from the cache.
	 * @param {string} scrollId The `data-deadsea-id` of the container to unregister.
	 */
	unregister(scrollId) {
		logr.info(`[deadSea] Unregistering scrollId: "${scrollId}"`);
		delete geometryCache[scrollId];
	},

	unregisterAll() {
		logr.info(`[deadSea] Unregistering all carousels.`);
		Object.keys(geometryCache).forEach((key) => delete geometryCache[key]);
	},

	/**
	 * @param {string} scrollId
	 * @param {'forward' | 'backward'} direction
	 * @returns {HTMLElement | undefined} The element to focus, or undefined if none found.
	 */
	page(scrollId, direction) {
		const scrollEl = document.querySelector(`[data-deadsea-id="${scrollId}"]`);
		if (!scrollEl || !(scrollEl instanceof HTMLElement)) {
			logr.warn(
				`[deadSea.page] Could not find element with data-deadsea-id: ${scrollId}`
			);
			return;
		}

		const geometry = getCachedGeometry(scrollEl);
		if (!geometry) return;

		const { scrollables: items } = geometry;
		const orientation =
			$dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
		const isHorizontal = orientation === Orientation.HORIZONTAL;

		// The `items` are now retrieved from the cache.

		const containerRect = scrollEl.getBoundingClientRect();

		if (direction === 'forward') {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item instanceof HTMLElement) {
					const itemRect = item.getBoundingClientRect();
					let targetFound = false;
					if (isHorizontal) {
						// Find the first item whose right edge is outside the container's right boundary.
						if (itemRect.right > containerRect.right) {
							targetFound = true;
						}
					} else {
						// Find the first item whose bottom edge is outside the container's bottom boundary.
						if (itemRect.bottom > containerRect.bottom) {
							targetFound = true;
						}
					}

					if (targetFound) {
						return item;
					}
				}
			}
		} else {
			// Paging backward is more complex. We need to find the item that represents
			// the start of the "previous page".
			let firstVisibleItem = null;

			// 1. Find the first item that is currently visible in the viewport.
			for (const item of items) {
				if (item instanceof HTMLElement) {
					const itemRect = item.getBoundingClientRect();
					const isVisible = isHorizontal
						? itemRect.right > containerRect.left &&
							itemRect.left < containerRect.right
						: itemRect.bottom > containerRect.top &&
							itemRect.top < containerRect.bottom;
					if (isVisible) {
						firstVisibleItem = item;
						break;
					}
				}
			}

			if (!firstVisibleItem) {
				// If nothing is visible (e.g., scrolled way too far), return the last item as a fallback.
				return items[items.length - 1];
			}

			// 2. Calculate the ideal starting position of the "previous page".
			const firstVisibleRect = firstVisibleItem.getBoundingClientRect();
			const targetPos = isHorizontal
				? firstVisibleRect.left - containerRect.width
				: firstVisibleRect.top - containerRect.height;

			// 3. Find the item whose start edge is closest to that target position.
			let bestCandidate = null;
			let minDistance = Infinity;

			for (const item of items) {
				if (item instanceof HTMLElement) {
					const itemRect = item.getBoundingClientRect();
					const itemPos = isHorizontal ? itemRect.left : itemRect.top;
					const distance = Math.abs(itemPos - targetPos);

					if (distance < minDistance) {
						minDistance = distance;
						bestCandidate = item;
					} else {
						// Optimization: Since items are ordered, once the distance starts
						// increasing, we've passed the best candidate.
						break;
					}
				}
			}

			return bestCandidate || undefined;
		}
	},
};
