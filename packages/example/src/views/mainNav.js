import { collectionToArray, createBaseView } from 'crt';
import { navigationService } from '../services/navigationService.js';
import { Nav } from '../components/Nav.js';

/**
 * @typedef {import('crt').ViewOptions & {
 *  navItems: import('../components/Nav').NavItem[]
 * }} NavViewOptions
 */

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  navItems: import('../components/Nav').NavItem[],
 *  boundUpdateActive?: () => void,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  listenToNavigation: (listen: boolean) => void,
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
	const mainNavView = Object.assign({}, base, {
		navItems: options.navItems,

		/** @this {MainNavViewInstance} */
		destructor: function () {
			this.listenForFocus(false);
			this.listenToNavigation(false);
		},

		/** @this {MainNavViewInstance} */
		viewDidLoad: function () {
			this.listenForFocus(true);
			this.listenToNavigation(true);
			this.updateActive();
		},

		/**
		 * @param {boolean} listen
		 * @this {MainNavViewInstance}
		 */
		listenToNavigation: function (listen) {
			// Bind the method once to ensure the same function reference is used for add/remove
			this.boundUpdateActive =
				this.boundUpdateActive || this.updateActive.bind(this);

			const method = listen ? 'on' : 'off';
			navigationService
				.getBus()
				[method]('route:changed', this.boundUpdateActive);
			window[listen ? 'addEventListener' : 'removeEventListener'](
				'popstate',
				this.boundUpdateActive
			);
		},

		/** @this {MainNavViewInstance} */
		updateActive: function () {
			if (!this.viewEl) return;
			const path = location.pathname;
			const els = this.viewEl.querySelectorAll('[href]');
			collectionToArray(els).forEach((/** @type {Element} */ el) =>
				el.classList.remove('active')
			);
			const elToFocus = this.viewEl.querySelector(`[href="${path}"]`);
			if (elToFocus) {
				elToFocus.classList.add('active');
			}
		},

		/**
		 * @param {boolean} listen
		 * @this {MainNavViewInstance}
		 */
		listenForFocus: function (listen) {
			if (!this.viewEl) return;
			const method = listen ? 'addEventListener' : 'removeEventListener';
			this.viewEl[method]('focusin', this.updateMenu.bind(this, 'focusin'));
			this.viewEl[method](
				'focusout',
				this.updateMenu.bind(this, 'focusout') // Corrected from 'focusin'
			);
		},

		/**
		 * @param {'focusin' | 'focusout'} eventName
		 * @this {MainNavViewInstance}
		 */
		updateMenu: function (eventName) {
			if (!this.viewEl) return;
			const method = eventName === 'focusin' ? 'add' : 'remove';
			this.viewEl.classList[method]('collapsed');
		},

		/** @this {MainNavViewInstance} */
		render: function () {
			return Nav({
				id: this.id,
				navItems: this.navItems,
				blockExit: 'up down left',
				backStop: true,
			});
		},
	});

	return mainNavView;
}
