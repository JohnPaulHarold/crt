/**
 * @typedef {import('./declarations/types.js').AppOutlets} AppOutlets
 */

import { Nav } from './components/Nav.js';
import { initNavigation } from './navigation.js';
import { initRouting, routes } from './routes.js';

export const appOutlets = {
    main: { id: 'main' },
    nav: { id: 'nav' },
};

export function main() {
    initAppShell(appOutlets);
    initNavigation();
    initRouting();
}

/**
 * @name initAppShell
 * @param {AppOutlets} outlets
 */
function initAppShell(outlets) {
    const navEl = document.getElementById(outlets.nav.id);

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
