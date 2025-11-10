import type { BaseViewInstance, ViewOptions } from 'crt';
import type { RouteParams, RouteSearch } from './routes.js';
import type { HandlerArgs } from './libs/router/router.js';

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

export type AppViewOptions = ViewOptions & {
	pattern?: string;
	params?: RouteParams;
	search?: RouteSearch;
	initialData?: Record<string, unknown>;
};

let currentView: BaseViewInstance | null = null;

/**
 * @param createView - The view factory function.
 * @param options
 */
function loadView(createView: (options: AppViewOptions) => BaseViewInstance, options: HandlerArgs) {
	if (currentView) {
		currentView.detach();
	}

	currentView = createView(
		Object.assign(
			{},
			{
				id: options.pattern,
			},
			options
		)
	);

	if (appOutlets.main) {
		currentView.attach(appOutlets.main);
	}
	// The `emit` function expects a payload. Since the `mainNav` listener
	// for this event doesn't use the payload, we can pass `null`.
	navigationService.getBus().emit('route:changed', null);
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
				href: href,
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

/**
 * A map of view names to their factory functions, used for SSR hydration.
 * The index signature `[key: string]` tells TypeScript that we can access
 * its properties using a string variable.
 */
const viewFactories: Record<string, (options: AppViewOptions) => BaseViewInstance> = {
	player: createPlayerView,
	home: createHomeView,
	search: createSearchView,
	diff: createDiffView,
	'reactive-vlist': createReactiveVListView,
	// In the future, other views can be added here to support SSR hydration
};

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('root');
	if (!root) {
		logr.error('Root element #root not found');
		return;
	}

	// Step 1: Create the main application shell
	// This runs in BOTH modes. It creates the nav and the main outlet.
	const appShell = App();

	const ssrViewName = root.dataset.ssrView;
	const ssrViewElement = root.firstElementChild;

	if (ssrViewName && ssrViewElement && viewFactories[ssrViewName]) {
		// ::: HYDRATION MODE
		logr.info(`Hydrating server-rendered view: ${ssrViewName}`);

		// Hydrate the server-rendered view
		const createView = viewFactories[ssrViewName];
		// @ts-expect-error example app is unaware of `__INITIAL_DATA__` global declared in `crt`
		const initialData = window.__INITIAL_DATA__;

		const viewInstance = createView({
			id: ssrViewElement.id,
			initialData: initialData,
		});
		viewInstance.hydrate(ssrViewElement);
		currentView = viewInstance; // Keep track of the current view

		// Now, construct the final DOM by placing the hydrated view inside the app shell
		if (appOutlets.main) {
			appOutlets.main.appendChild(ssrViewElement);
		}
		// Replace the content of #root with the full app shell
		root.innerHTML = '';
		root.appendChild(appShell);
	} else {
		// ::: CLIENT-SIDE RENDERING MODE
		logr.info('Starting in client-side rendering mode.');
		// Just append the shell, the router will load the first view.
		root.appendChild(appShell);
	}

	// Step 2: Initialize router and navigation for BOTH modes
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

	historyRouter.config('/', 'history');

	navigationService.init();
});
