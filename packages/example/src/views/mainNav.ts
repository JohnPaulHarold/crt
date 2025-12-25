import type { BaseViewInstance, ViewOptions } from 'crt';
import type { NavItem } from '../components/Nav.js';

import { createBaseView } from 'crt';
import { navigationService } from '../services/navigationService.js';
import { Nav } from '../components/Nav.js';
import { collectionToArray } from 'crt-utils';

type NavViewOptions = ViewOptions & {
	navItems: NavItem[];
};

type MainNavViewInstance = BaseViewInstance & {
	navItems: NavItem[];
	boundUpdateActive?: () => void;
	destructor: () => void;
	viewDidLoad: () => void;
	listenToNavigation: (listen: boolean) => void;
	updateActive: () => void;
	listenForFocus: (listen: boolean) => void;
	updateMenu: (eventName: 'focusin' | 'focusout') => void;
	render: () => HTMLElement;
};

export function createMainNavView(
	options: NavViewOptions
): MainNavViewInstance {
	const base = createBaseView(options);

	const mainNavView: MainNavViewInstance = Object.assign({}, base, {
		navItems: options.navItems,

		destructor: function (this: MainNavViewInstance) {
			this.listenForFocus(false);
			this.listenToNavigation(false);
		},

		viewDidLoad: function (this: MainNavViewInstance) {
			this.listenForFocus(true);
			this.listenToNavigation(true);
			this.updateActive();
		},

		listenToNavigation: function (this: MainNavViewInstance, listen: boolean) {
			// Bind the method once to ensure the same function reference is used for add/remove
			this.boundUpdateActive =
				this.boundUpdateActive || this.updateActive.bind(this);

			const method = listen ? 'on' : 'off';
			const bus = navigationService.getBus();
			bus[method]('route:changed', this.boundUpdateActive);
			window[listen ? 'addEventListener' : 'removeEventListener'](
				'popstate',
				this.boundUpdateActive
			);
		},

		updateActive: function (this: MainNavViewInstance) {
			if (!this.viewEl) return;
			const path = location.pathname;
			const els = this.viewEl.querySelectorAll('[href]');
			collectionToArray<HTMLAnchorElement>(els).forEach((el) =>
				el.classList.remove('active')
			);
			const elToFocus = this.viewEl.querySelector(`[href="${path}"]`);
			if (elToFocus) {
				elToFocus.classList.add('active');
			}
		},

		listenForFocus: function (this: MainNavViewInstance, listen: boolean) {
			if (!this.viewEl) return;

			const method = listen ? 'addEventListener' : 'removeEventListener';

			this.viewEl[method]('focusin', this.updateMenu.bind(this, 'focusin'));
			this.viewEl[method](
				'focusout',
				this.updateMenu.bind(this, 'focusout') // Corrected from 'focusin'
			);
		},

		updateMenu: function (
			this: MainNavViewInstance,
			eventName: 'focusin' | 'focusout'
		) {
			if (!this.viewEl) return;

			const method = eventName === 'focusin' ? 'add' : 'remove';

			this.viewEl.classList[method]('collapsed');
		},

		render: function (this: MainNavViewInstance) {
			return Nav({
				props: {
					id: this.id,
					navItems: this.navItems,
					blockExit: 'up down left',
					backStop: true,
				},
			});
		},
	});

	return mainNavView;
}
