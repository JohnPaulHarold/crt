import { loga } from 'crt';
import { div, main } from './html.js';

import { historyRouter } from './libs/router/router.js';
import { navigationService } from './services/navigationService.js';
import { routes } from './routes.js';
import { appOutlets } from './outlets.js';

import { createHomeView } from './views/home.js';
import { createMainNavView } from './views/mainNav.js';
import { createSearchView } from './views/search.js';
import { createShowView } from './views/show.js';
import { createDiffView } from './views/diff.js';
import { createVListView } from './views/vlist.js';
import { createPlayerView } from './views/player.js';
import { createReactiveVListView } from './views/reactiveVListView.js';

import s from './index.scss';

const logr = loga.create('example');

/**
 * @typedef {import('crt').ViewOptions & {
 *  pattern: string;
 *  params: import('./routes.js').RouteParams;
 *  search: import('./routes.js').RouteSearch;
 * }} AppViewOptions
 */

/** @type {import('crt').BaseViewInstance | null} */
let currentView = null;

/**
 * @param {(options: AppViewOptions) => import('crt').BaseViewInstance} createView - The view factory function.
 * @param {import('./libs/router/router.js').HandlerArgs} options
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
	if (appOutlets.nav) {
		mainNavView.attach(appOutlets.nav);
	}

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

	historyRouter.registerRoute(routes.HOME, (opts) =>
		loadView(createHomeView, opts)
	);
	historyRouter.registerRoute(routes.SEARCH, (opts) =>
		loadView(createSearchView, opts)
	);
	historyRouter.registerRoute(routes.SHOW, (opts) =>
		loadView(createShowView, opts)
	);
	historyRouter.registerRoute(routes.DIFF, (opts) =>
		loadView(createDiffView, opts)
	);
	historyRouter.registerRoute(routes.VLIST, (opts) =>
		loadView(createVListView, opts)
	);
	historyRouter.registerRoute(routes.PLAYER, (opts) =>
		loadView(createPlayerView, opts)
	);
	historyRouter.registerRoute(routes.REACTIVE_VLIST, (opts) =>
		loadView(createReactiveVListView, opts)
	);

	historyRouter.config('/', 'hash');

	navigationService.init();
});
