import type { BaseViewInstance } from 'crt';
import type { AppViewOptions } from '../index.js';
import type { RailItem } from './home.js';
import type { SignalerInstance } from 'crt-utils';

import { dataGet, createBaseView, diff } from 'crt';

import { a, div, span } from '../html.js';

import { keyMap } from '../config/keyMap.js';

import { searchData } from '../stubData/searchData.js';

import { Keyboard } from '../components/Keyboard.js';
import { Carousel } from '../components/Carousel.js';
import { deadSeaService } from '../libs/deadSea.js';

import s from './search.scss';
import {
	Orientation,
	createSignaler,
	normalizeEventTarget,
	watch,
} from 'crt-utils';

function handleClick(
	this: SearchViewInstance,
	event: KeyboardEvent | MouseEvent
) {
	const elTarget = normalizeEventTarget(event);
	if (elTarget instanceof HTMLElement) {
		const value = dataGet(elTarget, 'keyValue');
		if (typeof value !== 'string') return;

		// The navigationService now handles translating 'Enter' keydowns into clicks,
		// so this handler only needs to deal with the resulting click event.
		const currentTerm = this.searchTerm.getValue();
		let newTerm = currentTerm;

		switch (value) {
			case 'SPACE':
				newTerm += ' ';
				break;
			case 'DEL':
				newTerm = newTerm.slice(0, -1);
				break;
			default:
				newTerm += value;
				break;
		}
		this.searchTerm.setValue(newTerm);
	}
}

/**
 * Filters the search data based on the provided term.
 * @param term The search term.
 * @returns The filtered results.
 */
function getFilteredResults(term: string): RailItem[] {
	if (!term) return [];

	const lowerCaseTerm = term.toLowerCase();

	return searchData.filter((d) =>
		d.title.toLowerCase().includes(lowerCaseTerm)
	);
}

function getTemplate(this: SearchViewInstance): HTMLElement {
	const searchTerm = this.searchTerm.getValue();
	const filteredResults = getFilteredResults(searchTerm);

	let resultsEl;
	if (searchTerm === '') {
		resultsEl = span({
			props: { className: s.searchNoResults },
			children: "Let's search!",
		});
	} else if (filteredResults.length > 0) {
		resultsEl = div({
			children: Carousel({
				props: {
					id: 'search-results-list',
					orientation: Orientation.VERTICAL,
					showArrows: true,
					blockExit: 'right down',
					width: 700,
					height: 900,
				},
				children: filteredResults.map((res) =>
					a({
						props: { href: res.url, id: res.id },
						children: div({
							props: { className: s.searchResult },
							children: span({ children: res.title }),
						}),
					})
				),
			}),
		});
	} else {
		resultsEl = span({
			props: { className: s.searchNoResults },
			children: 'Found nothing...',
		});
	}

	return div({
		props: { className: 'view', id: this.id },
		children: [
			div({
				props: { className: s.searchInput, id: 'search-input' },
				children: searchTerm,
			}),
			div({
				props: { className: s.panels2 },
				children: [Keyboard({ props: { keyMap } }), resultsEl],
			}),
		],
	});
}

type SearchViewInstance = BaseViewInstance & {
	searchTerm: SignalerInstance<string>;
	boundHandleClick?: (event: MouseEvent) => void;
	stopWatching?: () => void;
	destructor: () => void;
	viewDidLoad: () => void;
	render: () => Element;
};

export function createSearchView(options: AppViewOptions): SearchViewInstance {
	const base = createBaseView(
		Object.assign({}, options, { preserveAttributes: ['data-focus'] })
	);

	const searchView: SearchViewInstance = Object.assign({}, base, {
		searchTerm: createSignaler(''),
		boundHandleClick: undefined,
		stopWatching: undefined,

		destructor: function (this: SearchViewInstance) {
			if (this.viewEl instanceof HTMLElement && this.boundHandleClick) {
				this.viewEl.removeEventListener('click', this.boundHandleClick);
			}
			if (this.stopWatching) {
				this.stopWatching();
			}
			// Reset state for when view is re-created
			this.searchTerm.setValue('');
			deadSeaService.unregister('search-results-list-carousel');
		},

		viewDidLoad: function (this: SearchViewInstance) {
			if (this.viewEl instanceof HTMLElement) {
				this.boundHandleClick = handleClick.bind(this);
				this.viewEl.addEventListener('click', this.boundHandleClick);

				const setupResultsCarousel = () => {
					if (this.viewEl) {
						const carouselEl = this.viewEl.querySelector(
							'#search-results-list .carousel'
						);
						if (carouselEl instanceof HTMLElement) {
							deadSeaService.register(carouselEl);
						}
					}
				};

				const reactiveUpdateHandler = () => {
					if (this.viewEl) {
						// Unregister the old carousel before diffing
						deadSeaService.unregister('search-results-list-carousel');

						const vdom = getTemplate.call(this);
						diff(vdom, this.viewEl, {
							preserveAttributes: this.preserveAttributes,
						});

						// Register the new one after diffing
						setupResultsCarousel();
					}
				};
				this.stopWatching = watch([this.searchTerm], reactiveUpdateHandler);
			}
		},

		render: function (this: SearchViewInstance) {
			return getTemplate.call(this);
		},
	});

	return searchView;
}
