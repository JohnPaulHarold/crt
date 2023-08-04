/**
 * @typedef {import('../declarations/types').Route} Route
 * @typedef {import('../declarations/types').RouteParams} RouteParams
 * @typedef {import('../declarations/types').RouteSearch} RouteSearch
 */

import { parseSearchParams } from '../utils/parseSearchParams';

export class Hashish {
    /**
     *
     * @param {Array<Route>} routes
     */
    constructor(routes) {
        this.routes = routes;

        this.currentView = null;
        this.nextView = null;

        window.addEventListener(
            'hashchange',
            this.locationHashChanged.bind(this)
        );

        if (location.hash) {
            /** @type {HashChangeEvent|CustomEvent} */
            let hashChangeEvent;

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
        } else {
            // get the "default" and navigate to that
            this.routes.forEach((route) => {
                if (route.default) {
                    location.hash = '/' + route.id;
                }
            });
        }
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
     * @returns {{ route: Route, params: RouteParams, search: RouteSearch } | undefined}
     */
    matchRoute(url) {
        // strip out the searchParams if they are there

        const [routeUrl, paramsString] = url.split('?');

        let matched;

        for (let i = 0, l = this.routes.length; i < l; i++) {
            const route = this.routes[i];

            // an early check for paramless routes
            if ('/' + url === route.pattern) {
                matched = {
                    route,
                    params: {},
                    search: {},
                };
                break;
            }

            const routeMatcher = new RegExp(
                route.pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)')
            );
            const match = routeUrl.match(routeMatcher);

            if (!match) {
                continue;
            }

            if (match.index === 0) {
                const variables = route.pattern.match(/({[^}]*(\w+)[^}]*})/g);
                const [newRoute, routeId] = match;

                matched = {
                    route,
                    params: {
                        routeId: routeId,
                    },
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

        /** @type {string} */
        let nextRoute;
        let evt;

        if (event instanceof HashChangeEvent) {
            evt = event;
        } else {
            evt = event.detail;
        }

        const { newURL } = evt || {};

        let route = newURL;

        if (route) {
            let origin = location.origin;

            if (!origin) {
                origin = location.protocol + '//' + location.host;
            }

            nextRoute = route.replace(origin + '/', '').replace('#', '');
        } else {
            nextRoute = location.hash.replace('#', '');
        }

        try {
            // need to find the matching route
            const matchedRoute = this.matchRoute(nextRoute);

            if (!matchedRoute) {
                throw new Error('no matched route');
            }

            matchedRoute.route.handler(matchedRoute);
        } catch (error) {
            console.error('[Router] failed to load view component', error);
        }
    }
}
