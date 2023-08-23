/**
 * @typedef {import('../declarations/types').NavViewOptions} NavViewOptions
 */

import { BaseView } from '../libs/baseView';
import { Nav } from '../components/Nav';
import { collectionToArray } from '../utils/collectionToArray';

/**
 * @typedef {Object} DiffState
 * @property {boolean} menuOpen
 */

/**
 * @extends BaseView
 */
export class MainNav extends BaseView {
    /**
     * @param {NavViewOptions} options
     */
    constructor(options) {
        super(options);
        this.navItems = options.navItems;
    }

    destructor() {
        const listen = false;
        this.listenForFocus(listen);
        this.listenToHashChange(listen);
    }

    viewDidLoad() {
        const listen = true;
        this.listenForFocus(listen);
        this.listenToHashChange(listen);
        this.updateActive();
    }

    /**
     *
     * @param {boolean} listen
     */
    listenToHashChange(listen) {
        const method = listen ? 'addEventListener' : 'removeEventListener';
        window[method]('hashchange', this.updateActive.bind(this));
    }

    updateActive() {
        const hash = location.hash;
        const els = this.viewEl.querySelectorAll('[href]');
        collectionToArray(els).forEach((el) => el.classList.remove('active'));
        const elToFocus = this.viewEl.querySelector('[href="' + hash + '"]');
        elToFocus && elToFocus.classList.add('active');
    }

    /**
     *
     * @param {boolean} listen
     */
    listenForFocus(listen) {
        const method = listen ? 'addEventListener' : 'removeEventListener';
        this.viewEl[method]('focusin', this.updateMenu.bind(this, 'focusin'));
        this.viewEl[method]('focusout', this.updateMenu.bind(this, 'focusin'));
    }

    /**
     *
     * @param {'focusin'|'focusout'} eventName
     */
    updateMenu(eventName) {
        const method = eventName === 'focusin' ? 'add' : 'remove';
        this.viewEl.classList[method]('collapsed');
    }

    render() {
        return Nav({
            id: this.id,
            navItems: this.navItems,
            blockExit: 'up down left',
        });
    }
}
