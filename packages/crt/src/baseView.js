import { removeElement } from './utils/dom/removeElement.js';
import { div } from './makeElement.js';

/**
 * @typedef {object} ViewOptions
 * @property {string} [title]
 * @property {string} id
 * @property {import('../routes').RouteParams} [params]
 * @property {import('../routes').RouteSearch} [search]
 */

/**
 * Defines the shape of a BaseView instance.
 * @typedef {object} BaseViewInstance
 * @property {string} id - The unique ID of this view instance.
 * @property {string} [title] - The title of the view.
 * @property {HTMLElement} viewEl - The main HTML element representing this view.
 * @property {(parentElement: HTMLElement) => void} attach - Attaches the view to a parent DOM element.
 * @property {() => void} detach - Detaches the view from the DOM.
 * @property {() => HTMLElement} render - Renders the view and returns its main HTML element.
 * @property {() => void} viewWillLoad - Lifecycle hook called before the view is attached.
 * @property {() => void} viewDidLoad - Lifecycle hook called after the view is attached.
 * @property {() => void} destructor - Lifecycle hook called before the view is detached.
 */

/**
 * Base class for all views.
 * @constructor
 * @param {ViewOptions} options - Options for the view.
 * @this {BaseViewInstance}
 */
export function BaseView(options) {
    /** @type {string} The unique ID of this view instance. */
    this.id = options.id;

    /** @type {HTMLElement} The main HTML element representing this view. */
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
     * Attaches the view to a parent DOM element, renders it (if not already), and calls viewDidLoad.
     * @param {HTMLElement} parentElement The DOM element to attach this view to.
     * @this {BaseViewInstance}
     */
    attach: function (parentElement) {
        const viewContentEl = this.render();
        this.viewEl = viewContentEl;

        parentElement.appendChild(viewContentEl);

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
     * Renders the view. Subclasses should override this.
     * @returns {HTMLElement} The main element of the view.
     * @this {BaseViewInstance}
     */
    render: function () {
        const el = div({
            className: 'view',
            id: this.id,
        });

        return el;
    }
}

