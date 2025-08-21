/**
 * @typedef {Record<string, string>} RouteParams
 */

/**
 * @typedef {Record<string, string | number | boolean>} RouteSearch
 */

/**
 * @typedef {object} Route
 * @property {string} [id]
 * @property {boolean} [default]
 * @property {boolean} [exact]
 * @property {string} pattern
 * @property {string} [title]
 * @property {(arg0: any) => void} [composeFunction]
 */

/**
 * @typedef {object} HandlerArgs
 * @property {string} pattern
 * @property {RouteParams} params
 * @property {RouteSearch} search
 */

/**
 * @typedef {object} HashRouteHandlers
 * @property {(matchedRoute: HandlerArgs) => void} callback
 * @property {boolean} exact
 */
import { parseSearchParams } from './utils/parseSearchParams.js';
import { getRouteParams } from './utils/getRouteParams.js';

export const historyRouter = {
    /** @type {Record<string, HashRouteHandlers>} */
    handlers: {},
    basePath: '',
    mode: 'history', // 'history' or 'hash'
    hashSymbol: '#',
    /**
     * Configures the router.
     * @param {string} [base='/'] - The base path of the application.
     * @param {'history' | 'hash'} [mode='history'] - The routing mode.
     * @param {string} [hashSymbol='#'] - The symbol to use for hash-based routing.
     */
    config(base = '/', mode = 'history', hashSymbol = '#') {
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
        /** @type {HashChangeEvent|CustomEvent} */
        let hashChangeEvent;

        if (this.mode === 'hash') {
            // we try/catch here because some older browsers do not support
            // `HashChangeEvent` constructor
            try {
                /** @type {HashChangeEvent} */
                hashChangeEvent = new HashChangeEvent('hashchange', {
                    newURL: location.href,
                });
            } catch (error) {
                /** @type {CustomEvent} */
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

    /**
     * Processes a path change triggered by an event (hashchange or popstate).
     * @param {PopStateEvent|HashChangeEvent|CustomEvent|undefined} event
     * @param {object} [stateData={}] - Optional state data from history.
     */
    processPathFromEvent(event, stateData = {}) {
        if (!event) return;

        let currentFullPath;
        if (this.mode === 'hash') {
            const evt =
                event instanceof HashChangeEvent
                    ? event
                    : /** @type {CustomEvent} */ (event).detail;
            // Replace optional chaining: evt && evt.newURL
            currentFullPath = evt && evt.newURL ? evt.newURL : location.href; // Use location.href as fallback
        } else {
            // history mode (event is PopStateEvent)
            currentFullPath = location.pathname + location.search;
        }
        this.processPath(currentFullPath, stateData);
    },

    /**
     * Processes a given full path (URL or pathname + search) and triggers the matched route handler.
     * @param {string} fullPathOrUrl - The full URL (for hash mode) or pathname + search (for history mode).
     * @param {object} [stateData={}] - Optional state data from history.
     */
    processPath(fullPathOrUrl, stateData = {}) {
        if (!fullPathOrUrl) return;

        try {
            const matchedRoute = this.matchRoute(fullPathOrUrl);
            if (matchedRoute) {
                this.handlers[matchedRoute.pattern].callback(
                    Object.assign({}, matchedRoute, { state: stateData })
                );
            }
        } catch (error) {
            console.error('[Router] failed to load view component', error);
        }
    },

    /**
     *
     * @param {string} fullPathOrUrl - The full URL (if hash mode) or the pathname + search (if history mode).
     * @returns {{ pattern: string, params: RouteParams, search: RouteSearch } | undefined}
     */
    matchRoute(fullPathOrUrl) {
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
            };

            // if (match.index === 0) {
            // 	const variables = pattern.match(/({[^}]*(\w+)[^}]*})/g) || [];
            // 	const matchedVariables = match.slice(1);
            // 	/** @type { {[index: string]: string } } */
            // 	const params = {};

            // 	variables.forEach((variable, i) => {
            // 		// strip the brackets
            // 		const hashless = variable.replace(/{|}/g, '');
            // 		params[hashless] = matchedVariables[i];
            // 	});

            // 	matched = {
            // 		pattern,
            // 		params: params,
            // 	};
            // 	break;
            // }
        }

        // If a match was found (either exact or with params), populate the search object
        if (matched) {
            matched.search = parseSearchParams(paramsString);
        }

        return /** @type {{ pattern: string, params: RouteParams, search: RouteSearch } | undefined} */ (
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

    /**
     * Programmatically navigates to a new path.
     * @param {string} path - The new application path (e.g., /home, /episode/123).
     * @param {object} [state={}] - Optional state object (for history mode).
     * @param {string} [title=''] - Optional title (for history mode, often ignored).
     */
    navigate(path, state = {}, title = '') {
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

    /**
     *
     * @param {string|Route} pathObject
     * @param {(handler: HandlerArgs) => void} handler
     */
    registerRoute(pathObject, handler) {
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
     * @param {string} path
     */
    unregisterRoute(path) {
        delete this.handlers[path];
    },
};
