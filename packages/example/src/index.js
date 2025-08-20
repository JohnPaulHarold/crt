import { loga } from 'crt';
import { div, main } from './h.js';

import { hashish } from './libs/hashish.js';
import { initNavigation } from './navigation.js';
import { routes } from './routes.js';
import { appOutlets } from './outlets.js';

import { createHomeView } from './views/home.js';
import { createMainNavView } from './views/mainNav.js';
import { createSearchView } from './views/search.js';
import { createShowView } from './views/show.js';
import { createDiffView } from './views/diff.js';
import { createVListView } from './views/vlist.js';

import s from './index.scss';

const logr = loga.create('example');

/** @type {import('crt/types').BaseViewInstance | null} */
let currentView = null;

/**
 * @param {(options: import('crt/types').ViewOptions) => import('crt/types').BaseViewInstance} createView - The view factory function.
 * @param {import('./libs/hashish').HandlerArgs} options
 */
function loadView(createView, options) {
    if (currentView) {
        currentView.detach();
    }

    currentView = createView({
        id: options.pattern,
        ...options,
    });

    if (appOutlets.main) {
        currentView.attach(appOutlets.main);
    }
}

function App() {
    appOutlets.main = main({ id: 'main-outlet' });

    const navItems = Object.keys(routes)
        .filter((key) => routes[key].nav)
        .map((key) => {
            const route = routes[key];
            const href = route.navId
                ? route.pattern.replace('{id}', route.navId)
                : route.pattern;

            return {
                id: `nav-${key.toLowerCase()}`,
                title: route.title,
                href: `#${href}`,
            };
        });

    const mainNavView = createMainNavView({ id: 'main-nav', navItems });

    // Render the view and attach it to both the DOM and its controller logic
    appOutlets.nav = mainNavView.render();
    mainNavView.attach(appOutlets.nav);

    return div({ id: 'app-container', className: s.container }, [
        appOutlets.nav,
        appOutlets.main,
    ]);
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (!root) {
        logr.error('Root element #root not found');
        return;
    }

    const app = App();
    root.appendChild(app);

    hashish.registerRoute(routes.HOME, (opts) =>
        loadView(createHomeView, opts)
    );
    hashish.registerRoute(routes.SEARCH, (opts) =>
        loadView(createSearchView, opts)
    );
    hashish.registerRoute(routes.SHOW, (opts) =>
        loadView(createShowView, opts)
    );
    hashish.registerRoute(routes.DIFF, (opts) =>
        loadView(createDiffView, opts)
    );
    hashish.registerRoute(routes.VLIST, (opts) =>
        loadView(createVListView, opts)
    );

    hashish.config('/');

    initNavigation();
});
