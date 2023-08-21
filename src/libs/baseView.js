import { removeElement } from '../utils/removeElement';
import { div } from './makeElement';

/**
 * @constructor
 */
export class BaseView {
    /**
     * @param {import("../declarations/types").ViewOptions} options
     */
    constructor({ id }) {
        /**
         * @type {string}
         * @public
         */
        this.id = id;

        /**
         * @type {HTMLElement}
         * @public
         */
        this.viewEl;

        this.viewWillLoad();
    }

    /**
     *
     * @returns {void}
     */
    destructor() {
        // console.log('[BaseView][destructor]');
    }

    /**
     *
     */
    viewWillLoad() {
        // console.log('[BaseView][viewWillLoad]');
    }

    /**
     *
     */
    viewDidLoad() {
        // console.log(`[${this.id}][viewDidLoad]`);
    }

    /**
     *
     */
    viewWillUnload() {
        // console.log('[BaseView][viewWillUnload]');
    }

    /**
     *
     */
    viewDidUnload() {
        // console.log('[BaseView][viewDidUnload]');
    }
    /**
     *
     * @param {Element} el
     */
    attach(el) {
        const viewContentEl = this.render();
        this.viewEl = viewContentEl;

        el.appendChild(viewContentEl);

        // this timeout forces the viewDidLoad to the next tick
        // giving time for the DOM to be updated.
        // feels like a hack...
        // ideally, using MutationObserver would be better for this
        setTimeout(this.viewDidLoad.bind(this), 0);
    }

    /**
     *
     */
    detach() {
        this.viewWillUnload();
        this.destructor();

        removeElement(this.viewEl);

        this.viewDidUnload();
    }

    /**
     *
     *@returns {HTMLElement}
     */
    render() {
        const el = div({
            className: 'view',
            id: this.id,
        });

        return el;
    }
}
