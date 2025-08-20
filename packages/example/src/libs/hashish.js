/**
 * @typedef {object} HandlerArgs
 * @property {string} pattern
 * @property {import('../routes').RouteParams} params
 * @property {import('../routes').RouteSearch} search
 */

/**
 * @typedef {object} RouteHandler
 * @property {(args: HandlerArgs) => void} callback
 * @property {boolean} exact
 */

import { parseSearchParams } from 'crt';

export const hashish = {
    /** @type {Record<string, RouteHandler>} */
    handlers: {},
    basePath: '',
    hashSymbol: '#',

    /**
     * Configures and initializes the router.
     * @param {string} path - The base path of the application.
     * @param {string} [hash] - The hash symbol to use (defaults to '#').
     */
    config(path, hash) {
        this.basePath = path;
        if (hash) {
            this.hashSymbol = hash;
        }

        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        // Handle the initial route on page load
        this.handleHashChange();
    },

    /**
     * The main handler for hash changes. Also used for initial route resolving.
     * @param {HashChangeEvent} [event]
     */
    handleHashChange(event) {
        const url = event ? event.newURL : location.href;
        try {
            const matchedRoute = this.matchRoute(url);

            if (matchedRoute) {
                this.handlers[matchedRoute.pattern].callback(matchedRoute);
            }
        } catch (error) {
            console.log('[Router] failed to load view component', error);
        }
    },

    /**
     * Creates a regular expression from a route pattern.
     * @param {string} routeUrl - The URL path segment to test.
     * @param {string} pattern - The route pattern (e.g., '/users/{id}').
     * @returns {RegExpMatchArray | null}
     */
    getMatchFromPattern(routeUrl, pattern) {
        // Creates a regex from the pattern, converting segments like {id} to capture groups.
        // Anchors with ^ and $ to ensure the whole string matches, preventing partial matches.
        const routeMatcher = new RegExp(
            '^' + pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)') + '$'
        );
        return routeUrl.match(routeMatcher);
    },

    /**
     * Matches a URL against registered route patterns.
     * @param {string} url - The full URL to match.
     * @returns {HandlerArgs | undefined}
     */
    matchRoute(url) {
        // location.origin doesn't work on some old browsers, so we build it
        const origin = location.protocol + '//' + location.host;
        const path = url.replace(origin, '');
        // The route is the part after the hash symbol, or the whole path if no hash
        const route = path.split(this.hashSymbol)[1] || path;

        // Strip out the searchParams if they are there
        const [routeUrl, paramsString] = route.split('?');

        let matched;

        // note: pattern will be without the hash, such as `/` or `/foo`
        for (const pattern in this.handlers) {
            if (Object.prototype.hasOwnProperty.call(this.handlers, pattern)) {
                const match = this.getMatchFromPattern(routeUrl, pattern);

                if (!match) {
                    continue;
                }

                // Extract path variables (e.g., {id})
                const variables = pattern.match(/({[^}]*(\w+)[^}]*})/g) || [];
                const matchedVariables = match.slice(1);
                /** @type { import('../routes').RouteParams } */
                const params = {};

                variables.forEach(function (variable, i) {
                    // strip the brackets
                    const key = variable.replace(/{|}/g, '');
                    params[key] = matchedVariables[i];
                });

                matched = {
                    pattern,
                    params: params,
                    search: parseSearchParams(paramsString),
                };

                break; // Found a match, stop looping
            }
        }

        return matched;
    },

    /**
     * Registers a route handler.
     * @param {string | {pattern: string, exact?: boolean}} pathObject - The route pattern or a route object.
     * @param {(handler: HandlerArgs) => void} handler - The callback function for the route.
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

        this.handlers[pattern] = {
            callback: handler,
            exact,
        };
    },

    /**
     * Unregisters a route handler.
     * @param {string} path - The route pattern to unregister.
     */
    unregisterRoute(path) {
        delete this.handlers[path];
    },
};
