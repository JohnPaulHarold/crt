import type {
	BaseViewInstance,
	ComponentProps,
	OrientationType,
	SignallerInstance,
} from 'crt';
import type { AppViewOptions } from '../index.js';

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

export interface PageData {
	title?: string;
	id: string;
	items: RailData[];
}

export interface RailItem extends ComponentProps {
	// Extend ComponentProps
	title: string;
	id: string;
	url: string;
}

export interface RailData extends ComponentProps {
	// Extend ComponentProps
	title?: string;
	id: string;
	orientation?: OrientationType;
	items: RailItem[];
}

function getTemplate(this: HomeViewInstance): HTMLElement {
	const data = this.pageData.getValue();
	let content;

	if (!data) {
		content = Spinner({ props: { message: 'Hold on!' } });
	} else {
		content = buildCarousels(data);
	}

	return div({
		props: { className: 'view', id: this.id },
		children: content,
	});
}

function findNextBackStop(el: HTMLElement | null): HTMLElement | undefined {
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

function focusPage(el: HTMLElement) {
	if (!el) return;
	navigationService.focusInto(el);
}

function listenForBack(this: HomeViewInstance, flag: boolean) {
	if (!this.viewEl) return;

	const method = flag
		? this.viewEl.addEventListener
		: this.viewEl.removeEventListener;

	method('keydown', handleBack);
}

function handleBack(event: Event) {
	if (
		event instanceof KeyboardEvent &&
		assertKey(event, AdditionalKeys.BACKSPACE)
	) {
		const elTarget = normaliseEventTarget(event);

		if (elTarget instanceof HTMLElement) {
			const nextBack = findNextBackStop(elTarget);

			if (nextBack) {
				navigationService.focusInto(nextBack);
			} else {
				// focus into the menu
				const navEl = appOutlets['nav'];

				if (!(navEl instanceof HTMLElement)) return;

				navigationService.focusInto(navEl);
			}
		}
	}
}

function buildCarousels(data: PageData): HTMLElement {
	return Carousel({
		props: {
			id: data.id,
			orientation: Orientation.VERTICAL,
			childQuery: `#${data.id} .home-carousel`,
			blockExit: 'up down right',
			backStop: 'viewStart',
			showArrows: true,
			width: 1670,
			height: 1080,
		},
		children: data.items.map((rail) =>
			Carousel({
				props: {
					id: rail.id,
					showArrows: true,
					heading: rail.title,
					className: 'home-carousel',
					orientation: Orientation.HORIZONTAL,
					blockExit: 'right',
					backStop: 'viewStart',
					itemMargin: 24,
					width: 1670,
				},
				children: rail.items.map((railItem) =>
					a({
						props: {
							dataset: { external: true },
							href: railItem.url,
							id: railItem.id,
						},
						children: Tile({ props: railItem }),
					})
				),
			})
		),
	});
}

type HomeViewInstance = BaseViewInstance & {
	pageData: SignallerInstance<PageData | null>;
	stopWatching?: () => void;
	destructor: () => void;
	fetchData: () => void;
};

export function createHomeView(options: AppViewOptions): HomeViewInstance {
	const base = createBaseView(
		Object.assign({}, options, {
			preserveAttributes: ['data-focus'],
		})
	);

	const homeView: HomeViewInstance = Object.assign({}, base, {
		// If initialData is provided (e.g., from SSR), use it.
		// Otherwise, start with null.
		pageData: createSignaller<PageData | null>(
			(options.initialData as unknown as PageData) || null
		),
		stopWatching: undefined,

		destructor: function (this: HomeViewInstance) {
			listenForBack.call(this, false);
			if (this.stopWatching) {
				this.stopWatching();
			}
			// When the view is destroyed, all its carousels are also destroyed,
			// so we should clear their geometry from the cache.
			deadSeaService.unregisterAll();
		},

		viewDidLoad: function (this: HomeViewInstance) {
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
				scrollAreas.forEach((el: Element) => {
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

		fetchData: function (this: HomeViewInstance) {
			setTimeout(() => {
				this.pageData.setValue(pageData);
			}, 500);
		},

		render: function (this: HomeViewInstance) {
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
