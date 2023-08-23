/**
 * @typedef {import('../declarations/types').Route} Route
 * @typedef {import('../declarations/types').RouteParams} RouteParams
 * @typedef {import('../declarations/types').RouteSearch} RouteSearch
 * @typedef {{ pattern: string, params: RouteParams, search: RouteSearch }} HandlerArgs
 */

import { parseSearchParams } from '../utils/parseSearchParams';

export const Hashish = (function () {
    /** @type { {[index: string]: { callback: (arg0: HandlerArgs) => void, exact: boolean}} } */
    const handlers = {};
    let baseUrl = '';

    /**
     * 
     * @param {string} baseUrl 
     */
    function config(path) {
        baseUrl = path;

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
     *
     * @param {HashChangeEvent|CustomEvent|undefined} event
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
            console.error('[Router] failed to load view component', error);
        }
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
        const route = path === baseUrl ? '/' : path.split('#')[1];

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

            const routeMatcher = new RegExp(
                pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)')
            );
            const match = routeUrl.match(routeMatcher);

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

    /**
     *
     * @param {string|Route} pathObject
     * @param {(handler: HandlerArgs) => void} handler
     */
    function registerRoute(pathObject, handler) {
        let path = '';
        let exact = false;
        if (typeof pathObject === 'string') {
            path = pathObject;
        } else {
            path = pathObject.pattern;
            exact = Boolean(pathObject.exact);
        }

        handlers[path] = {
            callback: handler,
            exact,
        };

        // then quickly check if our newly added route matches
        const matchedRoute = matchRoute(location.href);

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
