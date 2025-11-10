import { parseSearchParams } from './utils/parseSearchParams.js';
import { getRouteParams } from './utils/getRouteParams.js';

export type RouteParams = Record<string, string>;

export type RouteSearch = Record<string, string | number | boolean>;

export interface Route {
	id?: string;
	default?: boolean;
	exact?: boolean;
	pattern: string;
	title?: string;
	composeFunction?: (arg0: any) => void;
}

export interface HandlerArgs {
	pattern: string;
	params: RouteParams;
	search: RouteSearch;
}

export interface HashRouteHandlers {
	callback: (matchedRoute: HandlerArgs) => void;
	exact: boolean;
}

export interface HistoryRouter {
	handlers: Record<string, HashRouteHandlers>;
	basePath: string;
	mode: 'history' | 'hash';
	notFoundHandler: (() => void) | null;
	errorHandler: ((error: Error, route?: HandlerArgs) => void) | null;
	hashSymbol: string;
	config(base?: string, mode?: 'history' | 'hash', hashSymbol?: string): void;
	init(): void;
	/**
	 * Processes a path change triggered by an event (hashchange or popstate).
	 * @param event
	 * @param stateData - Optional state data from history.
	 */
	processPathFromEvent(event: PopStateEvent | HashChangeEvent | CustomEvent | undefined, stateData?: object): void;
	/**
	 * Processes a given full path (URL or pathname + search) and triggers the matched route handler.
	 * @param fullPathOrUrl - The full URL (for hash mode) or pathname + search (for history mode).
	 * @param stateData - Optional state data from history.
	 */
	processPath(fullPathOrUrl: string, stateData?: object): void;
	/**
	 * 
	 * @param fullPathOrUrl - The full URL (if hash mode) or the pathname + search (if history mode).
	 */
	matchRoute(fullPathOrUrl: string): { pattern: string; params: RouteParams; search: RouteSearch; } | undefined;
	setupListeners(): void;
	/**
	 * Programmatically navigates to a new path.
	 * @param path - The new application path (e.g., /home, /episode/123).
	 * @param state - Optional state object (for history mode).
	 * @param title - Optional title (for history mode, often ignored).
	 */
	navigate(path: string, state?: object, title?: string): void;
	/**
	 * Registers a handler to be called when no route matches the current path.
	 * @param handler The function to call for "not found" cases.
	 */
	registerNotFoundHandler(handler: () => void): void;
	/**
	 * Registers a handler to be called when a route handler throws an error.
	 * @param handler The function to call on error.
	 */	
	registerErrorHandler(handler: (error: Error, route?: HandlerArgs) => void): void;
	/**
	 *
	 * @param pathObject
	 * @param handler
	 */	
	registerRoute(pathObject: string | Route, handler: (handler: HandlerArgs) => void): void;
	unregisterRoute(path: string): void;
}

export const historyRouter: HistoryRouter = {
	handlers: {},
	basePath: '',
	mode: 'history',
	notFoundHandler: null,
	errorHandler: null,
	hashSymbol: '#',
	config(base: string = '/', mode: 'history' | 'hash' = 'history', hashSymbol: string = '#') {
		this.basePath = base.endsWith('/') ? base : base + '/';
		this.mode = mode;
		this.hashSymbol = hashSymbol;

		// Ensure basePath is consistent for hash mode if it's not just '/'
		// For hash mode, basePath usually refers to the part of the URL *before* the hash.
		// If basePath is '/app/' and mode is 'hash', URLs look like /app/#/route
		// If basePath is '/' and mode is 'hash', URLs look like /#/route
		if (
			this.mode === 'hash' &&
			!this.basePath.endsWith(this.hashSymbol + '/')
		) {
			// This part might need adjustment based on how you want basePath to behave with hash routing.
			// For now, let's assume basePath is the part before the hash.
		}

		this.setupListeners();
		this.init();
	},
	init() {
		let hashChangeEvent: HashChangeEvent | CustomEvent;

		if (this.mode === 'hash') {
			// we try/catch here because some older browsers do not support
			// `HashChangeEvent` constructor
			try {
				hashChangeEvent = new HashChangeEvent('hashchange', {
					newURL: location.href,
				});
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (error) {
				hashChangeEvent = new CustomEvent('hashchange', {
					detail: {
						newURL: location.href,
					},
				});
			}
			this.processPathFromEvent(hashChangeEvent);
		} else {
			// history mode
			this.processPath(location.pathname + location.search);
		}
	},
	processPathFromEvent(event, stateData) {
		if (!event) return;

		let currentFullPath;
		if (this.mode === 'hash') {
			const evt =
				event instanceof HashChangeEvent
					? event
					: (event as CustomEvent).detail;
			// Replace optional chaining: evt && evt.newURL
			currentFullPath = evt && evt.newURL ? evt.newURL : location.href; // Use location.href as fallback
		} else {
			// history mode (event is PopStateEvent)
			currentFullPath = location.pathname + location.search;
		}
		this.processPath(currentFullPath, stateData);
	},
	processPath(fullPathOrUrl, stateData) {
		if (!fullPathOrUrl) {
			return;
		}

		const _stateData = stateData || {};

		let matchedRoute: HandlerArgs | undefined;

		try {
			matchedRoute = this.matchRoute(fullPathOrUrl);
			if (matchedRoute) {
				this.handlers[matchedRoute.pattern].callback(
					Object.assign({}, matchedRoute, { state: _stateData })
				);
			} else {
				if (this.notFoundHandler) {
					this.notFoundHandler();
				} else {
					console.warn(`[Router] No route matched for path: ${fullPathOrUrl}`);
				}
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			if (this.errorHandler) {
				this.errorHandler(err, matchedRoute);
			} else {
				console.error('[Router] Error processing route:', error);
			}
		}
	},
	matchRoute(fullPathOrUrl: string): { pattern: string; params: RouteParams; search: RouteSearch; } | undefined {
		let route;
		if (this.mode === 'hash') {
			// For hash mode, fullPathOrUrl is the full window.location.href
			const urlObj = new URL(fullPathOrUrl); // Use URL API for robust parsing
			let fragment = urlObj.hash; // Gets e.g., "#!@/user" or "#/user" or "#"

			if (fragment.startsWith('#')) {
				fragment = fragment.substring(1); // Remove leading '#', now e.g., "!@/user" or "/user" or ""
			}

			// this.hashSymbol is the configured custom prefix (e.g., "!@")
			// If default hash ('#') was used in config, this.hashSymbol would be '#'
			if (
				this.hashSymbol &&
				this.hashSymbol !== '#' &&
				fragment.startsWith(this.hashSymbol)
			) {
				// Custom symbol is present and matches the start of the fragment
				route = fragment.substring(this.hashSymbol.length);
			} else {
				// No custom symbol, or custom symbol is '#', or fragment doesn't start with custom symbol
				// In these cases, the fragment itself (after initial '#') is the route
				route = fragment;
			}
			if (!route.startsWith('/')) route = '/' + route; // Ensure the actual path part starts with /
		} else {
			// history mode
			// For history mode, fullPathOrUrl is pathname + search, e.g., /app/user?id=1
			// It needs to be made relative to basePath.
			route = fullPathOrUrl.startsWith(this.basePath)
				? fullPathOrUrl.substring(this.basePath.length - 1)
				: fullPathOrUrl;
			if (!route.startsWith('/')) route = '/' + route;
		}
		// strip out the searchParams if they are there
		const [routeUrl, paramsString] = route.split('?');

		let matched;

		// note: pattern will be without the hash, such as `/` or `/foo`
		for (const pattern in this.handlers) {
			if (routeUrl === pattern) {
				matched = {
					pattern,
					params: {},
					search: {},
				};

				break;
			}

			const params = getRouteParams(routeUrl, pattern);

			if (!params) {
				continue;
			}

			matched = {
				pattern,
				params: params,
				search: {},
			};
		}

		// If a match was found (either exact or with params), populate the search object
		if (matched) {
			matched.search = parseSearchParams(paramsString);
		}

		return (
			matched
		);
	},
	setupListeners() {
		if (this.mode === 'hash') {
			window.addEventListener('hashchange', (event) =>
				this.processPathFromEvent(event)
			);
		} else {
			// history mode
			window.addEventListener('popstate', (event) =>
				this.processPathFromEvent(event, event.state || {})
			);
		}
	},
	navigate(path: string, state: object = {}, title: string = '') {
		const appPath = path.startsWith('/') ? path : '/' + path; // Ensure leading slash

		if (this.mode === 'hash') {
			// For hash mode, basePath is part of the main URL, not the hash fragment
			location.hash = this.hashSymbol + appPath;
			// hashchange event will fire and call processPathFromEvent
		} else {
			// history mode
			const fullHistoryPath = this.basePath.slice(0, -1) + appPath;
			history.pushState(state, title, fullHistoryPath);
			// After pushState, popstate isn't fired, so manually process.
			// Pass the appPath (without basePath) and state.
			this.processPath(appPath, state);
		}
	},
	registerNotFoundHandler(handler: () => void) {
		this.notFoundHandler = handler;
	},
	registerErrorHandler(handler: (error: Error, route?: HandlerArgs) => void) {
		this.errorHandler = handler;
	},
	registerRoute(pathObject: string | Route, handler: (handler: HandlerArgs) => void) {
		let pattern = '';
		let exact = false;

		if (typeof pathObject === 'string') {
			pattern = pathObject;
		} else {
			pattern = pathObject.pattern;
			exact = Boolean(pathObject.exact);
		}

		// add the handler with the pattern as the path
		this.handlers[pattern] = {
			callback: handler,
			exact,
		};

		// Check if the newly registered route matches the current path
		let currentAppPathForMatch;

		if (this.mode === 'hash') {
			const hashPart = location.hash;
			currentAppPathForMatch = hashPart.startsWith(this.hashSymbol)
				? hashPart.substring(this.hashSymbol.length)
				: '/';
		} else {
			currentAppPathForMatch = location.pathname.startsWith(this.basePath)
				? location.pathname.substring(this.basePath.length - 1)
				: location.pathname;
		}
		if (!currentAppPathForMatch.startsWith('/'))
			currentAppPathForMatch = '/' + currentAppPathForMatch;

		const matchedRoute = getRouteParams(
			currentAppPathForMatch.split('?')[0],
			pattern
		);

		if (matchedRoute) {
			this.init();
		}
	},
	/**
	 * @param path
	 */
	unregisterRoute(path: string) {
		delete this.handlers[path];
	},
};
