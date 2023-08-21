/**
 * @typedef {import('./declarations/types.js').AppOutlets} AppOutlets
 */

import { EventBus } from './eventBus.js';
import { initNavigation } from './navigation.js';
import { initRouting, routes } from './routes.js';
import { MainNav } from './views/mainNav.js';

// todo: could these be acquired as part of bootstrap process
// injected into each BaseView class?
/** @type {AppOutlets} */
export const appOutlets = {};

export const eventBus = new EventBus('crt-events');

/**
 * @name initOutlets
 * @param {string[]} outletIds
 */
function initOutlets(outletIds) {
    outletIds.forEach((id) => {
        const el = document.getElementById(id);

        if (el) {
            appOutlets[id] = el;
        }
    });

    return appOutlets;
}

/**
 * @name main
 */
export function main() {
    // todo: we could lessen this hardcoding, by using data-attrs
    // ie: <div data-outlet="nav"/>
    // document.querySelectorAll('[data-outlet=*]')
    initOutlets(['main', 'nav', 'popups']);
    initAppShell(appOutlets);
    initNavigation();
    initRouting();
}

/**
 * @name initAppShell
 * @param {AppOutlets} outlets
 */
function initAppShell(outlets) {
    const navEl = outlets['nav'];
    const menuItems = routes.filter((route) => Boolean(route.title));
    const navItems = menuItems.map((route) => ({
        id: `nav-${route.id.toLowerCase()}`,
        title: route.title,
        href: `#${route.pattern.toLowerCase()}`,
    }));
    const MainNavView = new MainNav({
        id: 'main-nav',
        navItems,
    });

    MainNavView.attach(navEl);
}
