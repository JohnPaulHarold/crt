import { createBaseView, createSignaller, watch, diff, loga, scale } from 'crt';
import { div, p, section, a } from '../html.js'; // Assuming div, p, section, a are still needed
import { createReactiveVirtualList } from '../libs/reactiveVirtualList.js';
import {
	navigationService,
	NavigationEvents,
} from '../services/navigationService.js';
import { parseDecimal } from '../utils/math/parseDecimal.js';

import s from './reactiveVListView.scss';

// --- Data Generation (copied from imperative vlist view for comparison) ---

/**
 * @typedef {object} VListItem
 * @property {number} d Decimal
 * @property {string} b Binary
 * @property {string} h Hex
 */

/**
 * @param {number} dec
 * @returns {string}
 */
function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}

/**
 * @param {number} dec
 * @returns {string}
 */
function dec2hex(dec) {
	return (dec >>> 0).toString(16);
}

/**
 * @param {number} bigNumber
 * @returns {VListItem[]}
 */
function buildBigData(bigNumber) {
	/** @type {VListItem[]} */
	const bigData = [];
	for (let i = 0; i < bigNumber; i++) {
		bigData.push({
			d: i,
			b: dec2bin(i),
			h: dec2hex(i),
		});
	}
	return bigData;
}

// --- View Implementation ---

/**
 * @returns {HTMLElement}
 * @this {ReactiveVListViewInstance}
 */
function getTemplate() {
	// The initial render just creates the container.
	// The virtual list will be diffed into it later.
	return section({
		className: `view ${s.virtualList} lrud-container`,
		id: this.id,
		style: {
			height: '100%',
			overflow: 'hidden',
		}, // Hide overflow, scrolling is handled by transforms
	});
}

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  dataSignaller: import('crt').SignallerInstance,
 *  vl: import('../libs/reactiveVirtualList.js').ReactiveVirtualListInstance<VListItem> | null,
 *  stopWatching?: () => void,
 *  boundHandleMove?: (event: any) => void,
 *  handleMove: (event: any) => void,
 * }} ReactiveVListViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {ReactiveVListViewInstance}
 */
export function createReactiveVListView(options) {
	const base = createBaseView(options);

	/** @type {ReactiveVListViewInstance} */
	const reactiveVListView = {
		...base,
		dataSignaller: createSignaller(buildBigData(600)),
		vl: null,
		stopWatching: undefined,
		boundHandleMove: undefined,

		destructor: function () {
			if (this.stopWatching) {
				this.stopWatching();
			}
			if (this.boundHandleMove) {
				navigationService
					.getBus()
					.off(NavigationEvents.MOVE, this.boundHandleMove);
			}
		},

		/**
		 * @this {ReactiveVListViewInstance}
		 * @param {any} event
		 */
		handleMove: function (event) {
			if (this.vl && event.detail && event.detail.nextElement) {
				const index = parseDecimal(
					event.detail.nextElement.dataset.index || '0'
				);
				this.vl.setFocusedIndex(index);
			}
		},

		viewDidLoad: function () {
			if (!this.viewEl) return;
			/**
			 * Renders a single row. If the row is not visible, it renders a lightweight
			 * placeholder to keep the element focusable by lrud-spatial without the
			 * performance cost of rendering the full content. (This is now handled by the library)
			 * @param {VListItem} item
			 * @param {number} index
			 * @param {boolean} isVisible (This parameter is now always true for rendered items)
			 * @returns {HTMLElement}
			 */
			const renderRow = (item, index, isVisible) => {
				const content = div({ className: s.vlistItemInner }, [
					p({}, `Decimal: ${item.d}`),
					p({}, `Binary: ${item.b}`),
					p({}, `Hex: ${item.h}`),
				]);

				return a(
					{
						className: s.vlistItem,
						href: '#',
						id: `vlist-item-${index}`, // Add a unique ID to act as a key for the diff engine
						dataset: {
							index: String(index), // Pass data attributes via the `dataset` object
						},
						/**
						 * @param {Event} e
						 */
						onclick: (e) => e.preventDefault(),
					},
					content
				);
			};

			this.vl = createReactiveVirtualList({
				dataSignaller: this.dataSignaller,
				renderRow,
				itemHeight: 160, // All dimensions are in reference 1080p pixels
				gap: 20,
				animate: true, // Enable animation
				containerTag: 'ul',
				itemWrapperTag: 'li',
				scrollAlign: 'center', // Start scrolling as soon as focus hits the edge.
				containerHeight: 1080, // The reference height of the container
			});

			const initialVdom = this.vl.render();
			this.viewEl.appendChild(initialVdom);

			// Watch for changes to the focused index and re-render with a diff
			this.stopWatching = watch([this.vl.focusedIndexSignaller], () => {
				if (this.viewEl && this.vl && this.viewEl.firstChild) {
					diff(this.vl.render(), this.viewEl.firstChild);
				}
			});

			// Listen to navigation events to update the focused index
			this.boundHandleMove = this.handleMove.bind(this);
			if (this.boundHandleMove) {
				navigationService
					.getBus()
					.on(NavigationEvents.MOVE, this.boundHandleMove);
			}

			// Set initial focus on the list
			navigationService.focusInto(this.viewEl);
		},

		render: function () {
			return getTemplate.call(this);
		},
	};

	return reactiveVListView;
}
