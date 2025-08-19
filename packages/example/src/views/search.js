import {
    a,
    div,
    span,
    BaseView,
    $dataGet,
    assertKey,
    handleKeydownOnElement,
    AdditionalKeys,
    Orientation,
    normaliseEventTarget,
} from 'crt';

import { keyMap } from '../config/keyMap.js';

import { searchData } from '../stubData/searchData.js';

import { Keyboard } from '../components/Keyboard.js';
import { Carousel } from '../components/Carousel.js';

import s from './search.scss';

/**
 * @extends BaseView
 * @typedef {BaseView & Search} SearchView
 */

/**
 * @constructor
 * @param {import('../libs/baseView').ViewOptions} options
 * @this {SearchView}
 */
export function Search(options) {
    BaseView.call(this, options);

    this.keyboard = Keyboard({ keyMap: keyMap });
    this.searchTerm = '';
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

    this.listenToKeyboard();    
}

// inherit from BaseView
Search.prototype = Object.create(BaseView.prototype);
// Set the constructor back
Search.prototype.constructor = Search;

Search.prototype.destructor = function () {
    if (this.keyHandleCleanup) {
        this.keyHandleCleanup();
    }
}

Search.prototype.listenToKeyboard = function () {
    this.keyHandleCleanup = handleKeydownOnElement(
        this.keyboard,
        this.handleKeyboard.bind(this)
    );
}

/**
 *
 * @param {KeyboardEvent | MouseEvent} event
 */
Search.prototype.handleKeyboard = function (event) {
    const elTarget = normaliseEventTarget(event);
    if (
        elTarget instanceof HTMLElement &&
        (
            event instanceof MouseEvent ||
            event instanceof KeyboardEvent && assertKey(event, AdditionalKeys.ENTER)
        )
    ) {
        const keyPressValue = $dataGet(elTarget, 'keyValue');

        if (typeof keyPressValue === 'string') {
            this.updateSearchInput(keyPressValue);
        }
    }
}

/**
 *
 * @param {string} value
 */
Search.prototype.updateSearchInput = function (value) {
    const searchInputEl = document.getElementById('search-input');

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

Search.prototype.updateSearchList = function () {
    const searchResultsEl = document.getElementById('search-results');

    // clear it
    if (searchResultsEl instanceof HTMLElement) {
        searchResultsEl.innerHTML = '';

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
                        div(
                            { className: s.searchResult },
                            span({}, res.title)
                        )
                    )
                )
            );

            return searchResultsEl.appendChild(newResults);
        }

        return searchResultsEl.appendChild(this.noResults);
    }
}

/**
 * @this {SearchView}
 * @returns {HTMLElement}
 */
Search.prototype.render = function () {
    return div(
        { className: 'view', id: this.id },
        div({ className: s.searchInput, id: 'search-input' }),
        div(
            { className: s.panels2 },
            this.keyboard,
            this.searchResults
        )
    );
}