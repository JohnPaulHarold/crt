import {
    $dataGet,
    createBaseView,
    assertKey,
    AdditionalKeys,
    Orientation,
    normaliseEventTarget,
    createSignaller,
    watch,
    diff,
} from 'crt';

import { a, div, span } from '../h.js';

import { keyMap } from '../config/keyMap.js';

import { searchData } from '../stubData/searchData.js';

import { Keyboard } from '../components/Keyboard.js';
import { Carousel } from '../components/Carousel.js';

import s from './search.scss';

/**
 * @this {SearchViewInstance}
 * @param {KeyboardEvent | MouseEvent} event
 */
function handleInteraction(event) {
    const elTarget = normaliseEventTarget(event);
    if (
        elTarget instanceof HTMLElement &&
        (event instanceof MouseEvent ||
            (event instanceof KeyboardEvent &&
                assertKey(event, AdditionalKeys.ENTER)))
    ) {
        // If the event is from a keyboard, prevent the default action.
        // This stops the browser from also firing a 'click' event for an Enter key press on a button.
        if (event instanceof KeyboardEvent) {
            event.preventDefault();
        }
        const value = $dataGet(elTarget, 'keyValue');
        if (typeof value !== 'string') return;

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
 * @param {string} term The search term.
 * @returns {import('./home.js').RailItem[]} The filtered results.
 */
function getFilteredResults(term) {
    if (!term) return [];
    const lowerCaseTerm = term.toLowerCase();
    return searchData.filter((d) =>
        d.title.toLowerCase().includes(lowerCaseTerm)
    );
}

/**
 * @returns {HTMLElement}
 * @this {SearchViewInstance}
 */
function getTemplate() {
    const searchTerm = this.searchTerm.getValue();
    const filteredResults = getFilteredResults(searchTerm);

    let resultsEl;
    if (searchTerm === '') {
        resultsEl = span({ className: s.searchNoResults }, "Let's search!");
    } else if (filteredResults.length > 0) {
        resultsEl = Carousel(
            {
                id: 'search-results-list',
                orientation: Orientation.VERTICAL,
                blockExit: 'right down',
            },
            filteredResults.map((res) =>
                a(
                    { href: res.url, id: res.id },
                    div({ className: s.searchResult }, span({}, res.title))
                )
            )
        );
    } else {
        resultsEl = span({ className: s.searchNoResults }, 'Found nothing...');
    }

    return div(
        { className: 'view', id: this.id },
        div({ className: s.searchInput, id: 'search-input' }, searchTerm),
        div({ className: s.panels2 }, this.keyboard, resultsEl)
    );
}

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  keyboard: HTMLElement,
 *  searchTerm: import('crt').SignallerInstance,
 *  boundHandleInteraction?: (event: KeyboardEvent | MouseEvent) => void,
 *  stopWatching?: () => void,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  render: () => HTMLElement
 * }} SearchViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {SearchViewInstance}
 */
export function createSearchView(options) {
    const base = createBaseView(options);

    /** @type {SearchViewInstance} */
    const searchView = {
        ...base,
        searchTerm: createSignaller(''),
        keyboard: Keyboard({ keyMap: keyMap }),
        boundHandleInteraction: undefined,
        stopWatching: undefined,

        destructor: function () {
            if (this.viewEl && this.boundHandleInteraction) {
                this.viewEl.removeEventListener(
                    'click',
                    this.boundHandleInteraction
                );
                this.viewEl.removeEventListener(
                    'keydown',
                    this.boundHandleInteraction
                );
            }
            if (this.stopWatching) {
                this.stopWatching();
            }
            // Reset state for when view is re-created
            this.searchTerm.setValue('');
        },

        viewDidLoad: function () {
            if (this.viewEl) {
                this.boundHandleInteraction = handleInteraction.bind(this);
                this.viewEl.addEventListener(
                    'click',
                    this.boundHandleInteraction
                );
                this.viewEl.addEventListener(
                    'keydown',
                    this.boundHandleInteraction
                );

                const handler = () => {
                    if (this.viewEl) {
                        const vdom = getTemplate.call(this);
                        diff(vdom, this.viewEl);
                    }
                };
                this.stopWatching = watch([this.searchTerm], handler);
            }
        },

        render: function () {
            return getTemplate.call(this);
        },
    };

    return searchView;
}
