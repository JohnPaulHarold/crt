import {
	normaliseEventTarget,
	AdditionalKeys,
	Orientation,
	$dataGet,
	assertKey,
	createBaseView,
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
		},
		data.items.map((rail) =>
			Carousel(
				{
					id: rail.id,
					title: rail.title,
					className: 'home-carousel',
					orientation: Orientation.HORIZONTAL,
					blockExit: 'right',
					backStop: 'viewStart',
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
 *  data: PageData | null,
 *  destructor: () => void,
 *  carousels: HTMLElement | null,
 *  fetchData: () => void,
 *  updateRender: (el?: HTMLElement) => void
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
		/** @type {PageData | null} */
		data: null,
		/** @type {HTMLElement | null} */
		carousels: null,

		destructor: function () {
			listenForBack.call(this, false);
		},

		viewDidLoad: function () {
			listenForBack.call(this, true);
		},

		fetchData: function () {
			setTimeout(() => {
				this.data = pageData;
				this.updateRender();
			}, 500);
		},

		/**
		 *
		 * @param {HTMLElement} [el]
		 */
		updateRender: function (el) {
			let target = this.viewEl;

			if (el) {
				target = el;
			}

			if (target && this.data) {
				target.innerHTML = '';
				this.carousels = buildCarousels(this.data);
				target.appendChild(this.carousels);

				focusPage(this.carousels);
			}
		},

		render: function () {
			if (!this.data) {
				return div(
					{ className: 'view', id: this.id },
					Spinner({ message: 'Hold on!' })
				);
			}

			return div({ className: 'view', id: this.id });
		},
	};

	homeView.fetchData();

	return homeView;
}
