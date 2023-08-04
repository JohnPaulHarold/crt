/**
 * @typedef {import('./declarations/types.js').AppOutlets} AppOutlets
 */

import { Hashish } from './libs/hashish.js';
import { Nav } from './components/Nav.js';
import { initNavigation } from './navigation.js';
import { routes } from './routes.js';

export const appOutlets = {
    main: { id: 'main' },
    nav: { id: 'nav' },
};

export function main() {
    initAppShell(appOutlets);
    initNavigation();

    new Hashish(routes);
}

/**
 *
 * @param {AppOutlets} outlets
 */
function initAppShell(outlets) {
    const navEl = document.getElementById(outlets.nav.id);

    const menuItems = routes.filter((route) => Boolean(route.title));

    const navItems = menuItems.map((route) => ({
        id: `nav-${route.id.toLowerCase()}`,
        title: route.title,
        href: `#/${route.id.toLowerCase()}`,
    }));

    navEl &&
        navEl.appendChild(
            Nav({ id: 'main-nav', navItems, blockExit: 'down left up' })
        );
}
