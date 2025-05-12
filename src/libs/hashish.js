/**
 * @typedef {import('../declarations/types').Route} Route
 * @typedef {import('../declarations/types').RouteParams} RouteParams
 * @typedef {import('../declarations/types').RouteSearch} RouteSearch
 * @typedef {{ pattern: string, params: RouteParams, search: RouteSearch }} HandlerArgs
 * @typedef {Record<string,{ callback: (matchedRoute: HandlerArgs) => void; exact: boolean }>} HashRouteHandlers
 */

import { parseSearchParams } from '../utils/dom/parseSearchParams';

export const hashish = {
    /** @type {HashRouteHandlers}>} */
    handlers: {},
    basePath: '',
    hashSymbol: '#',

    /**
     *
     * @param {string} path
     * @param {string} [hash]
     */
    config(path, hash) {
        this.basePath = path;
        if (hash) {
            this.hashSymbol = hash;
        }

        this.setupListeners();
        this.init();
    },

    init() {
        /** @type {HashChangeEvent|CustomEvent} */
        let hashChangeEvent;

        // we try/catch here because some older browsers do not support
        // `HashChangeEvent` constructor
        try {
            /** @type {HashChangeEvent} */
            hashChangeEvent = new HashChangeEvent('hashchange', {
                newURL: location.href,
            });
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            /** @type {CustomEvent} */
            hashChangeEvent = new CustomEvent('hashchange', {
                detail: {
                    newURL: location.href,
                },
            });
        }

        this.navigateTo(hashChangeEvent);
    },

    /**
     * @name navigateTo
     * @param {HashChangeEvent|CustomEvent|undefined} event
     * @todo could probably change the signature to a URL rather than Event
     */
    navigateTo(event) {
        if (!event) {
            return;
        }

        let evt;

        if (event instanceof HashChangeEvent) {
            evt = event;
        } else {
            evt = event.detail;
        }

        const { newURL } = evt || {};

        try {
            const matchedRoute = this.matchRoute(newURL);

            if (matchedRoute) {
                this.handlers[matchedRoute.pattern].callback(matchedRoute);
            }
        } catch (error) {
            console.log('[Router] failed to load view component', error);
        }
    },

    /**
     *
     * @param {string} routeUrl
     * @param {string} pattern
     * @returns {RegExpMatchArray | null}
     */
    getMatchFromPattern(routeUrl, pattern) {
        const routeMatcher = new RegExp(
            pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)')
        );
        const match = routeUrl.match(routeMatcher);

        return match;
    },

    /**
     *
     * @param {string} url
     * @returns {{ pattern: string, params: RouteParams, search: RouteSearch } | undefined}
     */
    matchRoute(url) {
        // location.origin don't work on old browser

        const path = url.replace(location.protocol + '//' + location.host, '');
        // could be `/` or `/#/foo`
        const route = path.split(this.hashSymbol)[1] || path;

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

            if (this.handlers[pattern].exact) {
                continue;
            }

            const match = this.getMatchFromPattern(routeUrl, pattern);

            if (!match) {
                continue;
            }

            if (match.index === 0) {
                const variables = pattern.match(/({[^}]*(\w+)[^}]*})/g) || [];
                const matchedVariables = match.slice(1);
                /** @type { {[index: string]: string } } */
                const params = {};

                variables.forEach((variable, i) => {
                    // strip the brackets
                    const hashless = variable.replace(/{|}/g, '');
                    params[hashless] = matchedVariables[i];
                });

                matched = {
                    pattern,
                    params: params,
                    search: parseSearchParams(paramsString),
                };

                break;
            }
        }

        return matched;
    },

    setupListeners() {
        window.addEventListener('hashchange', this.locationHashChanged.bind(this));
    },

    /**
     *
     * @param {HashChangeEvent} event
     * @todo isn't this a bit pointless?
     */
    locationHashChanged(event) {
        this.navigateTo(event);
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

        // then quickly check if our newly added pattern matches the current url
        // if so, we can load up the view

        const matchedRoute = this.getMatchFromPattern(location.href, pattern);

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
}
