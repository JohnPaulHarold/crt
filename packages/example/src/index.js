import { div, main } from './h.js';

import { hashish } from './libs/hashish.js';
import { initNavigation } from './navigation.js';
import { routes } from './routes.js';
import { appOutlets } from './outlets.js';

import { Nav } from './components/Nav.js';

import { createHomeView } from './views/home.js';
import { createSearchView } from './views/search.js';
import { createShowView } from './views/show.js';
import { createDiffView } from './views/diff.js';
import { createVListView } from './views/vlist.js';

import s from './index.scss';

/** @type {import('crt').BaseViewInstance | null} */
let currentView = null;

/**
 * @param {(options: import('crt').ViewOptions) => import('crt').BaseViewInstance} createView - The view factory function.
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

    currentView.attach(appOutlets.main);
}

function App() {
    appOutlets.nav = Nav();
    appOutlets.main = main({ id: 'main-outlet' });

    return div({ id: 'app-container', className: s.container }, [
        appOutlets.nav,
        appOutlets.main,
    ]);
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (!root) {
        console.error('Root element #root not found');
        return;
    }

    const app = App();
    root.appendChild(app);

    hashish.registerRoute(routes.HOME, (opts) => loadView(createHomeView, opts));
    hashish.registerRoute(routes.SEARCH, (opts) => loadView(createSearchView, opts));
    hashish.registerRoute(routes.SHOW, (opts) => loadView(createShowView, opts));
    hashish.registerRoute(routes.DIFF, (opts) => loadView(createDiffView, opts));
    hashish.registerRoute(routes.VLIST, (opts) => loadView(createVListView, opts));

    hashish.config('/');

    initNavigation();
});