/**
 * @typedef {import('./declarations/types.js').ViewOptions} ViewOptions
 * @typedef {import('./declarations/types.js').Route} Route
 * @typedef {import('./declarations/types.js').RouteParams} RouteParams
 * @typedef {import('./declarations/types.js').RouteSearch} RouteSearch
 * @typedef {import('./libs/baseView.js')} BaseViewInstance
 */

import { Home } from './views/home.js';
import { Search } from './views/search.js';
import { Show } from './views/show.js';

import { BaseView } from './libs/baseView.js';
import { Hashish } from './libs/hashish.js';

import { Diff } from './views/diff.js';
import { Popupdemo } from './views/popupdemo.js';

import { appOutlets } from './main.js';

/** @type {Array<import('./declarations/types.js').Route>} */
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
];

/** @type {BaseViewInstance} */
let _currentView;
/** @type {BaseViewInstance | null} */
let _nextView;

/**
 * @name initRouting
 */
export function initRouting() {
    const router = new Hashish();

    routes.forEach((route) => {
        router.registerRoute(route, (routeInfo) => {
            handleViewChange(route, routeInfo);
        });
    });
}

/**
 * @name loadView
 * @param {BaseViewInstance} nextView
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
 * @name handleViewChange
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
