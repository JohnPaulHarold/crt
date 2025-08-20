import { collectionToArray, createBaseView } from 'crt';
import { Nav } from '../components/Nav.js';

/**
 * @typedef {import('crt/types').ViewOptions & {
 *  navItems: import('../components/Nav').NavItem[]
 * }} NavViewOptions
 */

/**
 * @typedef {import('crt/types').BaseViewInstance & {
 *  navItems: import('../components/Nav').NavItem[],
 *  boundUpdateActive?: () => void,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  listenToHashChange: (listen: boolean) => void,
 *  updateActive: () => void,
 *  listenForFocus: (listen: boolean) => void,
 *  updateMenu: (eventName: 'focusin' | 'focusout') => void,
 *  render: () => HTMLElement
 * }} MainNavViewInstance
 */

/**
 * @param {NavViewOptions} options
 * @returns {MainNavViewInstance}
 */
export function createMainNavView(options) {
    const base = createBaseView(options);

    /** @type {MainNavViewInstance} */
    const mainNavView = {
        ...base,
        navItems: options.navItems,

        destructor: function () {
            this.listenForFocus(false);
            this.listenToHashChange(false);
        },

        viewDidLoad: function () {
            this.listenForFocus(true);
            this.listenToHashChange(true);
            this.updateActive();
        },

        listenToHashChange: function (listen) {
            const method = listen ? 'addEventListener' : 'removeEventListener';
            // Bind the method once to ensure the same function reference is used for add/remove
            this.boundUpdateActive =
                this.boundUpdateActive || this.updateActive.bind(this);
            window[method]('hashchange', this.boundUpdateActive);
        },

        updateActive: function () {
            if (!this.viewEl) return;
            const hash = location.hash;
            const els = this.viewEl.querySelectorAll('[href]');
            collectionToArray(els).forEach((el) =>
                el.classList.remove('active')
            );
            const elToFocus = this.viewEl.querySelector(
                '[href="' + hash + '"]'
            );
            if (elToFocus) {
                elToFocus.classList.add('active');
            }
        },

        listenForFocus: function (listen) {
            if (!this.viewEl) return;
            const method = listen ? 'addEventListener' : 'removeEventListener';
            this.viewEl[method](
                'focusin',
                this.updateMenu.bind(this, 'focusin')
            );
            this.viewEl[method](
                'focusout',
                this.updateMenu.bind(this, 'focusout') // Corrected from 'focusin'
            );
        },

        updateMenu: function (eventName) {
            if (!this.viewEl) return;
            const method = eventName === 'focusin' ? 'add' : 'remove';
            this.viewEl.classList[method]('collapsed');
        },

        render: function () {
            return Nav({
                id: this.id,
                navItems: this.navItems,
                blockExit: 'up down left',
                backStop: true,
            });
        },
    };

    return mainNavView;
}
