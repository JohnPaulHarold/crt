import { removeElement } from './utils/dom/removeElement.js';
import { h } from './makeElement.js';

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
 * @property {string | undefined} [title] - The title of the view.
 * @property {HTMLElement | undefined} viewEl - The main HTML element representing this view.
 * @property {(parentElement: HTMLElement) => void} viewWillLoad - Lifecycle hook called before the view is attached.
 * @property {() => void} viewDidLoad - Lifecycle hook called after the view is attached.
 * @property {() => void} viewWillUnload - Lifecycle hook called before the view is detached.
 * @property {() => void} viewDidUnload - Lifecycle hook called after the view is detached.
 * @property {() => void} destructor - Lifecycle hook called before the view is detached.
 * @property {(parentElement: HTMLElement) => void} attach - Attaches the view to a parent DOM element.
 * @property {() => void} detach - Detaches the view from the DOM.
 * @property {() => HTMLElement} render - Renders the view and returns its main HTML element.
 */

/**
 * Creates a base view object.
 * @param {ViewOptions} options - Options for the view.
 * @returns {BaseViewInstance}
 */
export function createBaseView(options) {
    /** @type {BaseViewInstance} */
    const view = {
        id: options.id,
        title: options.title,
        viewEl: undefined,

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
         */
        attach: function (parentElement) {
            const viewContentEl = this.render();
            this.viewEl = viewContentEl;

            parentElement.appendChild(viewContentEl);

            // this timeout forces the viewDidLoad to the next tick
            // giving time for the DOM to be updated.
            setTimeout(this.viewDidLoad.bind(this), 0);
        },

        detach: function () {
            this.viewWillUnload();
            this.destructor();

            if (this.viewEl) {
                removeElement(this.viewEl);
            }

            this.viewDidUnload();
        },

        /**
         * Renders the view. Subclasses should override this.
         * @returns {HTMLElement} The main element of the view.
         */
        render: function () {
            const el = h('div', {
                className: 'view',
                id: this.id,
            });

            return el;
        },
    };

    view.viewWillLoad();

    return view;
}
