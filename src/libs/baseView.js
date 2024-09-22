/**
 * @typedef {import ("../declarations/types").ViewOptions} ViewOptions
 */

import { removeElement } from '../utils/dom/removeElement';
import { div } from './makeElement';

/** @namespace BaseViewClass */
/**
 * @constructor
 * @param {ViewOptions} options
 */
export function BaseView(options) {
    /** @type {string} */
    this.id = options.id;

    /**
     * @type {HTMLElement}
     * @public
     */
    this.viewEl;

    this.viewWillLoad();
}

BaseView.prototype = {
    /**
     * @returns {void}
     */
    destructor: function () {
        // do nothing.
    },

    viewWillLoad: function () {
        // do nothing.
    },

    viewDidLoad: function () {
        // do nothing.
    },

    viewWillUnload: function () {
        // do nothing.
    },

    viewDidUnload: function () {
        // do nothing.
    },

    /**
     * @param {Element} el
     */
    attach: function (el) {
        const viewContentEl = this.render();
        this.viewEl = viewContentEl;

        el.appendChild(viewContentEl);

        // this timeout forces the viewDidLoad to the next tick
        // giving time for the DOM to be updated.
        // feels like a hack...
        // ideally, using MutationObserver would be better for this
        setTimeout(this.viewDidLoad.bind(this), 0);
    },

    detach: function () {
        this.viewWillUnload();
        this.destructor();

        removeElement(this.viewEl);

        this.viewDidUnload();
    },

    /**
     * @returns {HTMLElement}
     */
    render: function () {
        const el = div({
            className: 'view',
            id: this.id,
        });

        return el;
    }
}

