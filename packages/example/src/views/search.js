import {
    $dataGet,
    createBaseView,
    assertKey,
    handleKeydownOnElement,
    AdditionalKeys,
    Orientation,
    normaliseEventTarget,
} from 'crt';

import { a, div, span } from '../h.js';

import { keyMap } from '../config/keyMap.js';

import { searchData } from '../stubData/searchData.js';

import { Keyboard } from '../components/Keyboard.js';
import { Carousel } from '../components/Carousel.js';

import s from './search.scss';

/**
 * @this {SearchViewInstance}
 */
function listenToKeyboard() {
    return handleKeydownOnElement(
        this.keyboard,
        this.handleKeyboard.bind(this)
    );
}

/**
 * @this {SearchViewInstance}
 * @param {KeyboardEvent | MouseEvent} event
 */
function handleKeyboard(event) {
    const elTarget = normaliseEventTarget(event);
    if (
        elTarget instanceof HTMLElement &&
        (event instanceof MouseEvent ||
            (event instanceof KeyboardEvent &&
                assertKey(event, AdditionalKeys.ENTER)))
    ) {
        const keyPressValue = $dataGet(elTarget, 'keyValue');

        if (typeof keyPressValue === 'string') {
            this.updateSearchInput(keyPressValue);
        }
    }
}

/**
 * @this {SearchViewInstance}
 * @param {string} value
 */
function updateSearchInput(value) {
    // this.viewEl is the root element of the view
    const searchInputEl = this.viewEl?.querySelector('#search-input');
    if (searchInputEl instanceof HTMLElement) {
        this.searchTerm = searchInputEl.textContent || '';

        switch (value) {
            case 'SPACE':
                this.searchTerm += ' ';
                break;
            case 'DEL':
                this.searchTerm = this.searchTerm.slice(0, -1);
                break;
            default:
                this.searchTerm = this.searchTerm + value;
                break;
        }

        searchInputEl.textContent = this.searchTerm;
    }

    this.updateSearchList();
}

/**
 * @this {SearchViewInstance}
 */
function updateSearchList() {
    const searchResultsEl = this.searchResults;
    if (searchResultsEl && this.letsSearch && this.noResults) {
        searchResultsEl.innerHTML = ''; // clear it
        if (this.searchTerm === '') {
            return searchResultsEl.appendChild(this.letsSearch);
        }

        /** @type {import('./home').RailItem[]} */
        let filteredResults = [];

        if (this.searchTerm.length > 0) {
            filteredResults = searchData.filter((d) => {
                const normalisedName = d.title.toLowerCase();

                if (this.searchTerm.length < 3) {
                    return normalisedName.indexOf(this.searchTerm) === 0;
                }

                return normalisedName.indexOf(this.searchTerm) > -1;
            });
        }

        if (filteredResults.length > 0) {
            const newResults = Carousel(
                {
                    id: 'search-results-list',
                    orientation: Orientation.VERTICAL,
                    blockExit: 'right down',
                },
                filteredResults.map((res) =>
                    a(
                        {
                            dataset: { external: true },
                            href: res.url,
                            id: res.id,
                        },
                        div({ className: s.searchResult }, span({}, res.title))
                    )
                )
            );

            return searchResultsEl.appendChild(newResults);
        }

        return searchResultsEl.appendChild(this.noResults);
    }
}

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  keyboard: HTMLElement,
 *  searchTerm: string,
 *  keyHandleCleanup: (() => void) | null,
 *  letsSearch: HTMLElement | null,
 *  noResults: HTMLElement | null,
 *  searchResults: HTMLElement | null,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  handleKeyboard: (event: KeyboardEvent | MouseEvent) => void,
 *  updateSearchInput: (value: string) => void,
 *  updateSearchList: () => void,
 *  render: () => HTMLElement
 * }} SearchViewInstance
 */

/**
 * @param {import('crt').ViewOptions} options
 * @returns {SearchViewInstance}
 */
export function createSearchView(options) {
    const base = createBaseView(options);

    /** @type {SearchViewInstance} */
    const searchView = {
        ...base,
        keyboard: Keyboard({ keyMap: keyMap }),
        searchTerm: '',
        keyHandleCleanup: null,
        letsSearch: null,
        noResults: null,
        searchResults: null,

        destructor: function () {
            if (this.keyHandleCleanup) {
                this.keyHandleCleanup();
            }
        },
        viewDidLoad: function () {
            this.keyHandleCleanup = listenToKeyboard.call(this);
        },

        handleKeyboard: handleKeyboard,
        updateSearchInput: updateSearchInput,
        updateSearchList: updateSearchList,

        render: function () {
            this.letsSearch = span(
                { className: s.searchNoResults },
                "Let's search!"
            );
            this.noResults = span(
                { className: s.searchNoResults },
                'Found nothing...'
            );
            this.searchResults = div(
                {
                    id: 'search-results',
                    className: s.searchResults,
                },
                this.letsSearch
            );

            return div(
                { className: 'view', id: this.id },
                div({ className: s.searchInput, id: 'search-input' }),
                div({ className: s.panels2 }, this.keyboard, this.searchResults)
            );
        },
    };

    return searchView;
}
