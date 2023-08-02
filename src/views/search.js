/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').RailItem} RailItem
 */
import { a, div, span } from "../libs/makeElement";
import { BaseView } from "../libs/baseView";

import { keyMap } from "../config/keyMap";

import { searchData } from "../stubData/searchData";

import { getDataFromEl } from "../utils/getDataFromEl";
import { assertKey } from "../utils/keys";
import { handleKeydownOnElement } from "../utils/handleKeydownOnElement";

import { AdditionalKeys } from "../enums/AdditionalKeys";
import { Orientation } from "../enums/Orientation";

import { Keyboard } from "../components/Keyboard";
import { Carousel } from "../components/Carousel";

import s from './search.css';
/**
 * @extends BaseView
 */
export class Search extends BaseView {
  /**
   * @param {ViewOptions} options
   */
  constructor(options) {
    super(options);

    this.keyboard = Keyboard({ keyMap: keyMap });
    this.searchTerm = '';
    this.letsSearch = span({ className: s.searchNoResults }, "Let's search!");
    this.noResults = span({ className: s.searchNoResults }, "Found nothing...");

    this.listenToKeyboard();
  }

  destructor() {
    if (this.keyHandleCleanup) {
      this.keyHandleCleanup();
    }
  }

  listenToKeyboard() {
    this.keyHandleCleanup = handleKeydownOnElement(
      this.keyboard,
      this.handleKeyboard.bind(this)
    )
  }

  /**
   * 
   * @param {KeyboardEvent} event 
   */
  handleKeyboard(event) {
    if (event.target instanceof HTMLElement && assertKey(event, AdditionalKeys.ENTER)) {
      const keyPressValue = getDataFromEl(event.target, 'keyValue');

      if (typeof keyPressValue === "string") {
        this.updateSearchInput(keyPressValue);
      }
    }
  }

  /**
   * 
   * @param {string} value 
   */
  updateSearchInput(value) {
    const searchInputEl = document.getElementById("search-input");

    if (searchInputEl instanceof HTMLElement) {
      this.searchTerm = searchInputEl.textContent || '';

      switch (value) {
        case "SPACE":
          this.searchTerm += " ";
          break;
        case "DEL":
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

  updateSearchList() {
    const searchResultsEl = document.getElementById("search-results");

    // clear it
    if (searchResultsEl instanceof HTMLElement) {
      searchResultsEl.innerHTML = '';

      if (this.searchTerm === '') {
        return searchResultsEl.appendChild(this.letsSearch);
      }

      /** @type {RailItem[]} */
      let filteredResults = [];

      if (Boolean(this.searchTerm.length)) {
        filteredResults = searchData.filter((d) => {
          const normalisedName = d.title.toLowerCase();

          if (this.searchTerm.length < 3) {
            return normalisedName.indexOf(this.searchTerm) === 0;
          }

          return normalisedName.indexOf(this.searchTerm) > -1
        })
      }

      if (Boolean(filteredResults.length)) {
        const newResults = Carousel(
          {
            id: 'search-results-list',
            orientation: Orientation.VERTICAL,
            blockExit: 'right down'
          },
          filteredResults.map((res) => (
            a({ dataset: { external: true }, href: res.url, id: res.id },
              div(
                { className: s.searchResult },
                span({}, res.title)
              )
            )
          )),
        )

        return searchResultsEl.appendChild(newResults);
      }

      return searchResultsEl.appendChild(this.noResults);
    }
  }

  render() {
    return (
      div(
        { className: 'view', id: this.id },
        div({ className: s.searchInput, id: 'search-input' }),
        div(
          { className: s.panels2 },
          this.keyboard,
          div(
            {
              id: 'search-results',
              className: s.searchResults,
            },
            this.letsSearch
          )
        )
      )
    )
  }
}