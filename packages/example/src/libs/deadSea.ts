/**
 * @module deadSea
 * @description
 * A utility for managing smooth, hardware-accelerated scrolling for spatial
 * navigation containers (carousels). It works by calculating the necessary
 * transform to apply to a scrollable element to bring a focused child into view.
 *
 * It is designed to be highly performant by caching the geometry of registered
 * carousels, avoiding expensive DOM measurements on every scroll action.
 *
 * ### Configuration
 * The behavior of a `deadSea` container is configured via `data-` attributes
 * on the scrollable element itself.
 *
 * @property {string} data-deadsea-id (Required)
 *   A unique identifier for this scroll container. This ID is used as the key
 *   for caching the container's geometry.
 *
 * @property {'horizontal' | 'vertical'} [data-deadsea-orientation='horizontal'] (Optional)
 *   The scrolling direction of the container.
 *
 * @property {string} [data-deadsea-child-query] (Optional)
 *   A CSS selector used to find the focusable/scrollable children within the
 *   container. If not provided, it defaults to the direct children of the
 *   scrollable element. This is useful when children are wrapped in other elements.
 *
 * @property {number} [data-deadsea-start-padding-items=0] (Optional)
 *   The number of items to keep visible at the start of the list as a visual
 *   padding. The container will only start scrolling once the focused item's
 *   index is greater than this value.
 */
import { dataGet, loga } from 'crt';

import { Orientation, collectionToArray, transformProp } from 'crt-utils';
import type { OrientationType } from 'crt-utils';

const logr = loga.create('deadsea');

/**
 * A cache to store pre-calculated geometry for each registered carousel.
 */
const geometryCache: Record<
	string,
	{ offsets: number[]; scrollables: HTMLElement[]; totalContentSize: number }
> = {};

const focusedQuery = '.focused';

function getScrollEl(el: HTMLElement): HTMLElement | undefined {
	if (!el || !el.parentElement) return;

	if (el.dataset.deadseaOrientation) {
		return el;
	}

	return getScrollEl(el.parentElement);
}

interface CachedGeometry {
	offsets: number[];
	scrollables: HTMLElement[];
	totalContentSize: number;
}

/**
 * Gets the geometry from the cache for a given scroll element.
 * This function assumes the geometry has already been registered.
 *
 * @param scrollEl The scrollable container element.
 * @returns The cached geometry or null if not found.
 */
function getCachedGeometry(scrollEl: HTMLElement): CachedGeometry | null {
	const scrollId = dataGet(scrollEl, 'deadseaId');
	if (!scrollId || typeof scrollId !== 'string') {
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
 */
function buildGeometry(scrollEl: HTMLElement): CachedGeometry | null {
	const orientation =
		dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
	const childQuery = dataGet(scrollEl, 'deadseaChildQuery');
	const startQs = dataGet(scrollEl, 'deadseaScrollStartQuery');
	const offsetProp =
		orientation === Orientation.HORIZONTAL ? 'offsetLeft' : 'offsetTop';
	const dimensionProp =
		orientation === Orientation.HORIZONTAL ? 'offsetWidth' : 'offsetHeight';

	const scrollables =
		childQuery && typeof childQuery === 'string'
			? collectionToArray<HTMLElement>(scrollEl.querySelectorAll(childQuery))
			: collectionToArray<HTMLElement>(scrollEl.children);

	if (scrollables.length === 0) return null;

	const startEl =
		startQs && typeof startQs === 'string'
			? document.querySelector(startQs)
			: null;

	let startElOffsetInPx = 0;
	if (startEl instanceof HTMLElement) {
		startElOffsetInPx = startEl[offsetProp];
	}

	const offsets = scrollables.map((s) => s[offsetProp] - startElOffsetInPx);

	const lastItem = scrollables[scrollables.length - 1];
	// The total content size is the offset of the last item plus its own size.
	const lastItemOffset = offsets[offsets.length - 1];
	const totalContentSize = lastItemOffset + lastItem[dimensionProp];

	return { offsets, scrollables, totalContentSize };
}

function findScrollableFromFocusEl(
	el: HTMLElement,
	scrollables: HTMLElement[]
): [HTMLElement, number] {
	const directChildIndex = scrollables.indexOf(el);
	if (directChildIndex !== -1) {
		return [el, directChildIndex];
	}

	// If not a direct child, check if it's a descendant of a scrollable item.
	for (let i = 0; i < scrollables.length; i++) {
		const scrollable = scrollables[i];

		if (scrollable.contains(el)) {
			return [scrollable, i];
		}
	}
	// If the element is not found at all, return -1
	return [el, -1];
}

function calculateOffset(
	offsets: number[],
	scrollableIndex: number,
	startPaddingItems: number
) {
	return offsets[Math.max(0, scrollableIndex - startPaddingItems)];
}

function updateScrollPosition(scrollEl: HTMLElement, useTransforms: boolean) {
	const geometry = getCachedGeometry(scrollEl);
	if (!geometry) {
		return;
	}

	const { offsets, scrollables, totalContentSize } = geometry;
	const focusedEl = document.querySelector(focusedQuery);

	const orientation = dataGet(scrollEl, 'deadseaOrientation')
		? (dataGet(scrollEl, 'deadseaOrientation') as OrientationType)
		: (Orientation.HORIZONTAL as OrientationType);

	const containerSize =
		orientation === Orientation.HORIZONTAL
			? scrollEl.offsetWidth
			: scrollEl.offsetHeight;

	// If all content fits within the container, no scrolling is needed.
	// Reset any existing scroll and exit.
	if (totalContentSize <= containerSize) {
		resetScroll(scrollEl, useTransforms, orientation);
		return;
	}

	const deadseaStartPaddingItems = dataGet(
		scrollEl,
		'deadseaStartPaddingItems'
	);
	const n =
		(typeof deadseaStartPaddingItems === 'string' ||
			typeof deadseaStartPaddingItems === 'number') &&
		deadseaStartPaddingItems
			? String(deadseaStartPaddingItems)
			: '0';
	const startPaddingItems = parseInt(n, 10);

	const scrollableIndex =
		focusedEl instanceof HTMLElement
			? findScrollableFromFocusEl(focusedEl, scrollables)[1]
			: 0;

	let newOffset = calculateOffset(offsets, scrollableIndex, startPaddingItems);

	const maxScrollOffset = totalContentSize - containerSize;
	// Cap the new offset to prevent scrolling past the end of the content.
	newOffset = Math.min(newOffset, maxScrollOffset);

	// Guard against invalid offset (e.g., from empty cache or bad index)
	if (typeof newOffset !== 'number' || !isFinite(newOffset)) {
		return;
	}

	if (scrollableIndex >= startPaddingItems) {
		if (!useTransforms) {
			const axis = orientation === Orientation.HORIZONTAL ? 'left' : 'top';
			scrollEl.style.setProperty(axis, -newOffset + 'px');
		} else if (transformProp) {
			const axis = orientation === Orientation.HORIZONTAL ? 'X' : 'Y';
			const style = scrollEl.style;
			style.setProperty(transformProp, `translate${axis}(${-newOffset}px)`);
		}
	} else {
		// Reset scroll position if we are before the start offset
		resetScroll(scrollEl, useTransforms, orientation);
	}
}

function resetScroll(
	scrollEl: HTMLElement,
	useTransforms?: boolean,
	orientation?: OrientationType
) {
	scrollEl.style.setProperty('left', '0px');
	scrollEl.style.setProperty('top', '0px');

	if (transformProp) {
		if (useTransforms) {
			const axis = (orientation || 'horizontal') === 'horizontal' ? 'X' : 'Y';
			scrollEl.style.setProperty(transformProp, `translate${axis}(0px)`);
		} else {
			scrollEl.style.setProperty(transformProp, '');
		}
	}
}

interface DeadSeaServiceInterface {
	scrollAction: (el: HTMLElement, useTransforms?: boolean) => void;
	/**
	 * Registers a scrollable element with the service, building and caching its geometry.
	 * @param scrollEl The scrollable element (the one with `data-deadsea-id`).
	 */
	register: (scrollEl: HTMLElement) => void;
	/**
	 * Removes a scrollable element's geometry from the cache.
	 * @param scrollId The `data-deadsea-id` of the container to unregister.
	 */
	unregister: (scrollId: string) => void;
	unregisterAll: () => void;
	/**
	 * @returns The element to focus, or undefined if none found.
	 */
	page: (
		scrollId: string,
		direction: 'forward' | 'backward'
	) => HTMLElement | undefined;
}

export const deadSeaService: DeadSeaServiceInterface = {
	scrollAction(el, useTransforms?) {
		let scrollEl = getScrollEl(el);

		while (scrollEl) {
			updateScrollPosition(scrollEl, !!useTransforms);
			scrollEl =
				scrollEl.parentElement instanceof HTMLElement
					? getScrollEl(scrollEl.parentElement)
					: undefined;
		}
	},

	register(scrollEl) {
		const scrollId = dataGet(scrollEl, 'deadseaId');
		if (!scrollId || typeof scrollId !== 'string') {
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

	unregister(scrollId) {
		logr.info(`[deadSea] Unregistering scrollId: "${scrollId}"`);
		delete geometryCache[scrollId];
	},

	unregisterAll() {
		logr.info(`[deadSea] Unregistering all carousels.`);
		Object.keys(geometryCache).forEach((key) => delete geometryCache[key]);
	},

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
			dataGet(scrollEl, 'deadseaOrientation') || Orientation.HORIZONTAL;
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
