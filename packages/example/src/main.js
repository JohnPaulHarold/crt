import { initOutlets, appOutlets } from './outlets.js';
import { NotificationsService } from './libs/notifications.js';
import { initNavigation } from './navigation.js';
import { initRouting, routes } from './routes.js';
import { MainNav } from './views/mainNav.js';

function buildApp() {
    // todo: we could lessen this hardcoding, by using data-attrs
    // ie: <div data-outlet="nav"/>
    // document.querySelectorAll('[data-outlet=*]')
    initOutlets(['main', 'nav', 'popups', 'notifications']);
    initAppShell(appOutlets);
    initNavigation();
    initRouting();
    initNotifications();
}

function initNotifications() {
    NotificationsService.outlet = appOutlets.notifications;
}

/**
 * @param {import('./outlets.js').AppOutlets} outlets
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

function bootstrap() {
    document.removeEventListener('DOMContentLoaded', bootstrap);
    buildApp();
}

document.addEventListener('DOMContentLoaded', bootstrap);
