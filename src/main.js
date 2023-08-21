/**
 * @typedef {import('./declarations/types.js').AppOutlets} AppOutlets
 */

import { Nav } from './components/Nav.js';
import { initNavigation } from './navigation.js';
import { initRouting, routes } from './routes.js';

// todo: could these be acquired as part of bootstrap process
// injected into each BaseView class?
/** @type {AppOutlets} */
export const appOutlets = {};

/**
 *
 * @param {string[]} outletIds
 */
function initOutlets(outletIds) {
    outletIds.forEach((id) => {
        const el = document.getElementById(id);

        if (el) {
            appOutlets[id] = el;
        }
    });
}

export function main() {
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

    navEl &&
        navEl.appendChild(
            Nav({ id: 'main-nav', navItems, blockExit: 'down left up' })
        );
}
