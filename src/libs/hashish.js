/**
 * @typedef {import('../declarations/types').Route} Route
 * @typedef {import('../declarations/types').RouteParams} RouteParams
 * @typedef {import('../declarations/types').RouteSearch} RouteSearch
 * @typedef {{ pattern: string, params: RouteParams, search: RouteSearch }} HandlerArgs
 */

import { parseSearchParams } from '../utils/parseSearchParams';

export class Hashish {
    constructor() {
        /** @type { {[index: string]: { callback: (arg0: HandlerArgs) => void, exact: boolean}} } */
        this.handlers = {};

        this.setupListeners();
        this.init();
    }

    setupListeners() {
        window.addEventListener(
            'hashchange',
            this.locationHashChanged.bind(this)
        );
    }

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
        } catch (error) {
            /** @type {CustomEvent} */
            hashChangeEvent = new CustomEvent('hashchange', {
                detail: {
                    newURL: location.href,
                },
            });
        }

        this.navigateTo(hashChangeEvent);
    }

    /**
     *
     * @param {string} hashRoute
     * @returns
     */
    stripHash(hashRoute) {
        return hashRoute.replace('#', '');
    }

    /**
     *
     * @param {string|Route} pathObject
     * @param {(handler: HandlerArgs) => void} handler
     */
    registerRoute(pathObject, handler) {
        let path = '';
        let exact = false;
        if (typeof pathObject === 'string') {
            path = pathObject;
        } else {
            path = pathObject.pattern;
            exact = Boolean(pathObject.exact);
        }

        this.handlers[path] = {
            callback: handler,
            exact,
        };

        // then quickly check if our newly added route matches
        const matchedRoute = this.matchRoute(location.href);
        if (matchedRoute) {
            this.init();
        }
    }

    /**
     * @param {string} path
     */
    unregisterRoute(path) {
        delete this.handlers[path];
    }

    /**
     *
     * @param {HashChangeEvent} event
     */
    locationHashChanged(event) {
        this.navigateTo(event);
    }

    /**
     *
     * @param {string} url
     * @returns {{ pattern: string, params: RouteParams, search: RouteSearch } | undefined}
     */
    matchRoute(url) {
        const path = url.replace(location.origin, '');
        // could be `/` or `/#/foo`
        const route = path === '/' ? path : path.split('#')[1];

        // strip out the searchParams if they are there
        const [routeUrl, paramsString] = route.split('?');
        const handlers = this.handlers;

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
                const variables = pattern.match(/({[^}]*(\w+)[^}]*})/g);
                const matchedVariables = match.slice(1);
                /** @type { {[index: string]: string } } */
                const params = {};

                variables?.forEach((variable, i) => {
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

    /**
     *
     * @param {HashChangeEvent|CustomEvent|undefined} event
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
            console.error('[Router] failed to load view component', error);
        }
    }
}
