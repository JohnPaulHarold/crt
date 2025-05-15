import { BaseView } from '../libs/baseView';
import { Nav } from '../components/Nav';
import { collectionToArray } from '../utils/dom/collectionToArray';

/**
 * @typedef {import('../libs/baseView').ViewOptions & {
 *  navItems: import('../components/Nav').NavItem[]
 * }} NavViewOptions
 */

/**
 * @extends BaseView
 * @typedef {BaseView & MainNav} MainNavView
 */

/**
 * @constructor
 * @param {NavViewOptions} options
 * @this {MainNavView}
 */
export function MainNav(options) {
    BaseView.call(this, options);
    this.navItems = options.navItems;
}

// inherit from BaseView
MainNav.prototype = Object.create(BaseView.prototype);
// Set the constructor back
MainNav.prototype.constructor = MainNav;

// prototype methods
/**
 *
 * @this {MainNavView}
 */
MainNav.prototype.destructor = function () {
    const listen = false;
    this.listenForFocus(listen);
    this.listenToHashChange(listen);
}

/**
 *
 * @this {MainNavView}
 */
MainNav.prototype.viewDidLoad = function () {
    const listen = true;
    this.listenForFocus(listen);
    this.listenToHashChange(listen);
    this.updateActive();
}

/**
 *
 * @param {boolean} listen
 * @this {MainNavView}
 */
MainNav.prototype.listenToHashChange = function (listen) {
    const method = listen ? 'addEventListener' : 'removeEventListener';
    window[method]('hashchange', this.updateActive.bind(this));
}

/**
 * @this {MainNavView}
 */
MainNav.prototype.updateActive = function () {
    const hash = location.hash;
    const els = this.viewEl.querySelectorAll('[href]');
    collectionToArray(els).forEach((el) => el.classList.remove('active'));
    const elToFocus = this.viewEl.querySelector('[href="' + hash + '"]');
    elToFocus && elToFocus.classList.add('active');
}

/**
 * @this {MainNavView}
 * @param {boolean} listen
 */
MainNav.prototype.listenForFocus = function (listen) {
    const method = listen ? 'addEventListener' : 'removeEventListener';
    this.viewEl[method]('focusin', this.updateMenu.bind(this, 'focusin'));
    this.viewEl[method]('focusout', this.updateMenu.bind(this, 'focusin'));
}

/**
 * @this {MainNavView}
 * @param {'focusin'|'focusout'} eventName
 */
MainNav.prototype.updateMenu = function (eventName) {
    const method = eventName === 'focusin' ? 'add' : 'remove';
    this.viewEl.classList[method]('collapsed');
}

/**
 * @this {MainNavView}
 */
MainNav.prototype.render = function () {
    return Nav({
        id: this.id,
        navItems: this.navItems,
        blockExit: 'up down left',
    });
}
