import { div, main } from './h.js';

import { hashish } from './libs/hashish.js';
import { initNavigation } from './navigation.js';
import { routes } from './routes.js';
import { appOutlets } from './outlets.js';

import { Nav } from './components/Nav.js';

import { Home } from './views/home.js';
import { Search } from './views/search.js';
import { Show } from './views/show.js';
import { Diff } from './views/diff.js';
import { VList } from './views/vlist.js';

import s from './index.scss';

/** @type {import('crt').BaseViewInstance | null} */
let currentView = null;

/**
 * @param {any} View - The view constructor.
 * @param {import('./libs/hashish').HandlerArgs} options
 */
function loadView(View, options) {
    if (currentView) {
        currentView.detach();
    }

    currentView = new View({
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

    hashish.registerRoute(routes.HOME, (opts) => loadView(Home, opts));
    hashish.registerRoute(routes.SEARCH, (opts) => loadView(Search, opts));
    hashish.registerRoute(routes.SHOW, (opts) => loadView(Show, opts));
    hashish.registerRoute(routes.DIFF, (opts) => loadView(Diff, opts));
    hashish.registerRoute(routes.VLIST, (opts) => loadView(VList, opts));

    hashish.config('/');

    initNavigation();
});