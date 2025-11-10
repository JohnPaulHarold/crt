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
	loga,
} from 'crt';

import { a, div } from '../html.js';

import { pageData } from '../stubData/pageData.js';

import { Carousel } from '../components/Carousel.js';
import { Tile } from '../components/Tile.js';
import { Spinner } from '../components/Spinner.js';
import { navigationService } from '../services/navigationService.js';
import { deadSeaService } from '../libs/deadSea.js';
import { appOutlets } from '../outlets.js';

const logr = loga.create('home');

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

	return /** @type {HTMLElement} */ (
		div({ className: 'view', id: this.id }, content)
	);
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

	method('keydown', /** @type {EventListener} */ (handleBack));
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
				const navEl = /** @type {HTMLElement} */ (appOutlets['nav']);

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
			showArrows: true,
			width: 1670,
			height: 1080,
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
					width: 1670,
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
 *  pageData: import('crt').SignallerInstance<PageData | null>,
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
	const base = createBaseView(
		Object.assign({}, options, {
			preserveAttributes: ['data-focus'],
		})
	);

	/** @type {HomeViewInstance} */
	const homeView = Object.assign({}, base, {
		// If initialData is provided (e.g., from SSR), use it. Otherwise, start with null.
		pageData: createSignaller(
			/** @type {PageData | null} */ (options.initialData || null)
		),
		stopWatching: undefined,

		/** @this {HomeViewInstance} */
		destructor: function () {
			listenForBack.call(this, false);
			if (this.stopWatching) {
				this.stopWatching();
			}
			// When the view is destroyed, all its carousels are also destroyed,
			// so we should clear their geometry from the cache.
			deadSeaService.unregisterAll();
		},

		/** @this {HomeViewInstance} */
		viewDidLoad: function () {
			listenForBack.call(this, true);

			/**
			 * This function contains the logic to run AFTER the view is rendered with data.
			 * It registers the carousels with the deadSeaService and sets the initial focus.
			 */
			const setupViewWithData = () => {
				if (!this.viewEl) return;

				const data = this.pageData.getValue();
				if (!data) return;

				const scrollAreas = this.viewEl.querySelectorAll('[data-deadsea-id]');
				if (scrollAreas.length === 0) {
					logr.warn(
						'setupViewWithData: Could not find any scrollable areas to register.'
					);
				}
				scrollAreas.forEach((/** @type {Element} */ el) => {
					if (!(el instanceof HTMLElement)) {
						logr.error(
							'[viewDidLoad] a scrollArea was an Element other than HTMLElement'
						);
						return;
					}
					deadSeaService.register(el);
				});

				// Now that they are registered, we can focus the main container.
				const carouselsEl = this.viewEl.querySelector('#' + data.id);
				if (carouselsEl && carouselsEl instanceof HTMLElement) {
					focusPage(carouselsEl);
				}
			};

			// This handler is for when the data CHANGES reactively on the client.
			const reactiveUpdateHandler = () => {
				if (this.viewEl) {
					const vdom = getTemplate.call(this);
					diff(vdom, this.viewEl, {
						preserveAttributes: this.preserveAttributes,
					});
					setupViewWithData(); // Run setup after diffing.
				}
			};

			this.stopWatching = watch([this.pageData], reactiveUpdateHandler);

			// If we have initial data (from SSR or client-side fetch), run the setup logic.
			if (this.pageData.getValue()) {
				logr.info('Home view: running setup...');
				setupViewWithData();
			}
		},

		/** @this {HomeViewInstance} */
		fetchData: function () {
			setTimeout(() => {
				this.pageData.setValue(pageData);
			}, 500);
		},

		/** @this {HomeViewInstance} */
		render: function () {
			// The initial render will be based on the initial state (null data).
			return getTemplate.call(this);
		},
	});

	// If no initial data was provided, we're in client-side rendering mode.
	// Fetch the data as usual.
	if (!options.initialData) {
		homeView.fetchData();
	}

	return homeView;
}
