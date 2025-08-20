/**
 * @typedef {Record<string, string>} RouteParams
 * Represents dynamic parts of a URL pattern, e.g., `{id}` in `/show/{id}`.
 */

/**
 * @typedef {Record<string, string | number | boolean>} RouteSearch
 * Represents the query string parameters of a URL, e.g., `?name=foo`.
 */

/** @type {Record<string, {pattern: string, title: string, nav: boolean, navId?: string }>} */
export const routes = {
    HOME: { pattern: '/', title: 'Home', nav: true },
    SEARCH: { pattern: '/search', title: 'Search', nav: true },
    SHOW: { pattern: '/show/{id}', title: 'Show', nav: false, navId: '123' },
    DIFF: { pattern: '/diff', title: 'Diff', nav: true },
    VLIST: { pattern: '/vlist', title: 'VList', nav: true },
};