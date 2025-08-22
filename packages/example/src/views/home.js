import {
	normaliseEventTarget,
	AdditionalKeys,
	Orientation,
	$dataGet,
	assertKey,
	createBaseView,
	createSignaller,
	watch,
	diff,
} from 'crt';

import { a, div } from '../h.js';

import { pageData } from '../stubData/pageData.js';

import { Carousel } from '../components/Carousel.js';
import { Tile } from '../components/Tile.js';
import { Spinner } from '../components/Spinner.js';
import { navigationService } from '../services/navigationService.js';
import { appOutlets } from '../outlets.js';

/**
 * @typedef {object} RailItem
 * @property {string} title
 * @property {string} id
 * @property {string} url
 */

/**
 * @typedef {object} RailData
 * @property {string} [title]
 * @property {string} id
 * @property {Orientation} [orientation]
 * @property {RailItem[]} items
 */

/**
 * @returns {HTMLElement}
 * @this {HomeViewInstance}
 */
function getTemplate() {
	const data = this.pageData.getValue();
	let content;

	if (!data) {
		content = Spinner({ message: 'Hold on!' });
	} else {
		content = buildCarousels(data);
	}

	return div({ className: 'view', id: this.id }, content);
}

/**
 * @typedef {object} PageData
 * @property {string} [title]
 * @property {string} id
 * @property {RailData[]} items
 */

/**
 *
 * @param {HTMLElement|null} el
 * @returns {HTMLElement=}
 */
function findNextBackStop(el) {
	if (!el) {
		return;
	}

	if ($dataGet(el, 'backStop')) {
		const firstChild = el.children[0];

		// if you're already focused on the back-stop of the container
		// keep traversing the tree till you find the next
		if (
			firstChild.classList.contains('focused') ||
			firstChild.querySelector('.focused')
		) {
			return findNextBackStop(el.parentElement);
		}

		return el;
	}

	return findNextBackStop(el.parentElement);
}

/**
 * @param {HTMLElement} el
 */
function focusPage(el) {
	if (!el) return;
	navigationService.focusInto(el);
}

/**
 * @this {import('crt').BaseViewInstance}
 * @param {boolean} flag
 */
function listenForBack(flag) {
	if (!this.viewEl) return;

	const method = flag
		? this.viewEl.addEventListener
		: this.viewEl.removeEventListener;

	method('keydown', handleBack);
}

/**
 *
 * @param {KeyboardEvent} event
 */
function handleBack(event) {
	if (assertKey(event, AdditionalKeys.BACKSPACE)) {
		const elTarget = normaliseEventTarget(event);

		if (elTarget instanceof HTMLElement) {
			const nextBack = findNextBackStop(elTarget);

			if (nextBack) {
				navigationService.focusInto(nextBack);
			} else {
				// focus into the menu
				const navEl = appOutlets['nav'];

				if (!navEl) return;
				navigationService.focusInto(navEl);
			}
		}
	}
}

/**
 * @param {PageData} data
 * @returns {HTMLElement}
 */
function buildCarousels(data) {
	return Carousel(
		{
			id: data.id,
			orientation: Orientation.VERTICAL,
			childQuery: `#${data.id} .home-carousel`,
			blockExit: 'up down right',
			backStop: 'viewStart',
			showArrows: true
		},
		data.items.map((rail) =>
			Carousel(
				{
					id: rail.id,
					showArrows: true,
					heading: rail.title, // Use the restored 'heading' prop
					className: 'home-carousel',
					orientation: Orientation.HORIZONTAL,
					blockExit: 'right',
					backStop: 'viewStart',
					// Use itemMargin to create a gap between tiles
					itemMargin: 24,
				},
				rail.items.map((railItem) =>
					a(
						{
							dataset: { external: true },
							href: railItem.url,
							id: railItem.id,
						},
						Tile(railItem)
					)
				)
			)
		)
	);
}

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  pageData: import('crt').SignallerInstance,
 *  stopWatching?: () => void,
 *  destructor: () => void,
 *  fetchData: () => void,
 * }} HomeViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {HomeViewInstance}
 */
export function createHomeView(options) {
	const base = createBaseView(options);

	/** @type {HomeViewInstance} */
	const homeView = {
		...base,
		pageData: createSignaller(null),
		stopWatching: undefined,

		destructor: function () {
			listenForBack.call(this, false);
			if (this.stopWatching) {
				this.stopWatching();
			}
		},

		viewDidLoad: function () {
			listenForBack.call(this, true);

			const handler = () => {
				if (this.viewEl) {
					const vdom = getTemplate.call(this);
					diff(vdom, this.viewEl);

					// After the DOM is updated, if we have carousels, focus them.
					const data = this.pageData.getValue();
					if (data) {
						const carouselsEl = this.viewEl.querySelector(
							'#' + data.id
						);
						if (carouselsEl) {
							focusPage(carouselsEl);
						}
					}
				}
			};

			this.stopWatching = watch([this.pageData], handler);
		},

		fetchData: function () {
			setTimeout(() => {
				this.pageData.setValue(pageData);
			}, 500);
		},

		render: function () {
			// The initial render will be based on the initial state (null data).
			return getTemplate.call(this);
		}
	};

	homeView.fetchData();

	return homeView;
}
