/**
 * @typedef {import('../declarations/types').Route} Route
 * @typedef {import('../declarations/types').RouteParams} RouteParams
 * @typedef {import('../declarations/types').RouteSearch} RouteSearch
 * @typedef {{ pattern: string, params: RouteParams, search: RouteSearch }} HandlerArgs
 */

import { parseSearchParams } from '../utils/dom/parseSearchParams';

export const Hashish = (function () {
    /** @type { {[index: string]: { callback: (arg0: HandlerArgs) => void, exact: boolean}} } */
    const handlers = {};
    let basePath = '';
    let hashSymbol = '#';

    /**
     *
     * @param {string} path
     * @param {string} [hash]
     */
    function config(path, hash) {
        basePath = path;
        if (hash) {
            hashSymbol = hash;
        }

        setupListeners();
        init();
    }

    function init() {
        /** @type {HashChangeEvent|CustomEvent} */
        let hashChangeEvent;

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

        navigateTo(hashChangeEvent);
    }

    /**
     * @name navigateTo
     * @param {HashChangeEvent|CustomEvent|undefined} event
     * @todo could probably change the signature to a URL rather than Event
     */
    function navigateTo(event) {
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
            const matchedRoute = matchRoute(newURL);

            if (matchedRoute) {
                handlers[matchedRoute.pattern].callback(matchedRoute);
            }
        } catch (error) {
            console.log('[Router] failed to load view component', error);
        }
    }

    /**
     *
     * @param {string} routeUrl
     * @param {string} pattern
     * @returns {RegExpMatchArray | null}
     */
    function getMatchFromPattern(routeUrl, pattern) {
        const routeMatcher = new RegExp(
            pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)')
        );
        const match = routeUrl.match(routeMatcher);

        return match;
    }

    /**
     *
     * @param {string} url
     * @returns {{ pattern: string, params: RouteParams, search: RouteSearch } | undefined}
     */
    function matchRoute(url) {
        // location.origin don't work on old browser
        const path = url.replace(location.protocol + '//' + location.host, '');
        // could be `/` or `/#/foo`
        const route = path === basePath ? '/' : path.split(hashSymbol)[1];

        // strip out the searchParams if they are there
        const [routeUrl, paramsString] = route.split('?');

        let matched;

        // note: pattern will be without the hash, such as `/` or `/foo`
        for (const pattern in handlers) {
            if (routeUrl === pattern) {
                matched = {
                    pattern,
                    params: {},
                    search: {},
                };

                break;
            }

            if (handlers[pattern].exact) {
                continue;
            }

            const match = getMatchFromPattern(routeUrl, pattern);

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
    }

    function setupListeners() {
        window.addEventListener('hashchange', locationHashChanged);
    }

    /**
     *
     * @param {HashChangeEvent} event
     * @todo isn't this a bit pointless?
     */
    function locationHashChanged(event) {
        navigateTo(event);
    }

    function buildHref() {
        // all the more fun because location.origin doesn't always exist
        return location.protocol + '//' + location.host + location.pathname;
    }

    /**
     *
     * @param {string|Route} pathObject
     * @param {(handler: HandlerArgs) => void} handler
     */
    function registerRoute(pathObject, handler) {
        let pattern = '';
        let exact = false;
        if (typeof pathObject === 'string') {
            pattern = pathObject;
        } else {
            pattern = pathObject.pattern;
            exact = Boolean(pathObject.exact);
        }

        // add the handler with the pattern as the path
        handlers[pattern] = {
            callback: handler,
            exact,
        };

        // then quickly check if our newly added pattern matches the current url
        // if so, we can load up the view

        const matchedRoute = getMatchFromPattern(location.href, pattern);

        if (matchedRoute) {
            init();
        }
    }

    /**
     * @param {string} path
     */
    function unregisterRoute(path) {
        delete handlers[path];
    }

    return {
        config,
        registerRoute,
        unregisterRoute,
    };
})();
