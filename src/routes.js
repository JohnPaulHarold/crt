/**
 * @typedef {Record<string, string | number | boolean>} RouteParams
 */

/**
 * @typedef {Record<string, string | number | boolean>} RouteSearch
 */

/**
 * @typedef {object} Route
 * @property {boolean} [default]
 * @property {boolean} [exact]
 * @property {string} pattern
 * @property {string} [title]
 * @property {string} id
 * @property {*} [viewClass] // todo: fix this
 */

import { Home } from './views/home.js';
import { Search } from './views/search.js';
import { Show } from './views/show.js';
import { Canivideo } from './views/canivideo/canivideo.js';
import { Diff } from './views/diff.js';
import { Popupdemo } from './views/popupdemo.js';
import { VList } from './views/vlist.js';

import { BaseView } from './libs/baseView.js';
import { hashish } from './libs/hashish.js';

import { appOutlets } from './outlets.js';

/** @type {Route[]} */
export const routes = [
    // {
    //   pattern: '/show/{showId}/episode/{id}',
    //   id: 'nested',
    //   viewClass: Show,
    // },
    {
        pattern: '/',
        exact: true,
        title: 'Home',
        id: 'home',
        default: true,
        viewClass: Home,
    },
    {
        pattern: '/search',
        title: 'Search',
        id: 'search',
        viewClass: Search,
    },
    {
        pattern: '/diff',
        title: 'Diff',
        id: 'diff',
        viewClass: Diff,
    },
    {
        pattern: '/show/{showId}',
        id: 'show',
        viewClass: Show,
    },
    {
        pattern: '/popupdemo',
        title: 'Popup Demo',
        id: 'popupdemo',
        viewClass: Popupdemo,
    },
    {
        pattern: '/canivideo',
        title: 'Can I video?',
        id: 'canivideo',
        viewClass: Canivideo,
    },
    {
        pattern: '/vlist',
        title: 'VirtualList example',
        id: 'vlist',
        viewClass: VList,
    },
];

// todo: fix this, should be a BaseView "class"
/** @type {*} */
let _currentView;
/** @type {* | null} */
let _nextView;

export function initRouting() {
    hashish.config(location.pathname);

    routes.forEach((route) => {
        hashish.registerRoute(route, (routeInfo) => {
            handleViewChange(route, routeInfo);
        });
    });
}

/**
 * @param {*} nextView // todo: fix this
 */
function loadView(nextView) {
    const mainViewElement = appOutlets['main'];
    _nextView = nextView;

    if (mainViewElement && _nextView instanceof BaseView) {
        _nextView.attach(mainViewElement);
    }

    if (_currentView instanceof BaseView) {
        _currentView.detach();
    }

    _currentView = _nextView;
    _nextView = null;
}

/**
 * @typedef {{ params: RouteParams, search: RouteSearch }} RouteInfo
 * @param {Route} route
 * @param {RouteInfo} routeInfo
 * @returns {void}
 */
function handleViewChange(route, routeInfo) {
    const View = route.viewClass;
    const viewOptions = {
        id: route.id,
        title: route.title,
        params: routeInfo.params,
        search: routeInfo.search,
    };

    loadView(new View(viewOptions));

    return;
}
