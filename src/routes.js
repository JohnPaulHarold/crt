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
import { FormExample } from './views/formExample.js';
import { Canivideo } from './views/canivideo/canivideo.js';
import { Diff } from './views/diff.js';
import { Popupdemo } from './views/popupdemo.js';
import { VList } from './views/vlist.js';

import { BaseView } from './libs/baseView.js';
import { Hashish } from './libs/hashish.js';

import { appOutlets } from './outlets.js';

import { request } from './utils/async/request.js';
import { removeElement } from './utils/dom/removeElement.js';

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
        useSsr: true,
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
        pattern: '/formexample',
        title: 'Form example',
        id: 'formexample',
        viewClass: FormExample,
    },
    {
        pattern: '/vlist',
        title: 'VirtualList example',
        id: 'vlist',
        viewClass: VList,
    },
];

/** @type {BaseViewInstance | string } */
let _currentView;

/** @type {BaseViewInstance | null} */
let _nextView;

/**
 * @name initRouting
 */
export function initRouting() {
    Hashish.config(location.pathname);

    routes.forEach((route) => {
        Hashish.registerRoute(route, (routeInfo) => {
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

    if (!_currentView && !!mainViewElement.children.length) {
        // some left overs from a SSR
        mainViewElement.innerHTML = '';
    }

    if (mainViewElement && _nextView instanceof BaseView) {
        _nextView.attach(mainViewElement);
    }

    if (_currentView instanceof BaseView) {
        _currentView.detach();
    }

    if (typeof _currentView === 'string') {
        removeElement(document.getElementById(_currentView));
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
    if (route.useSsr) {
        // load in some HTML from a remote source
        const reqOptions = { 
            type: 'json', 
            url: 'http://localhost:8080/ssr?view=' + route.id
        };
        request(reqOptions)
            .then((res) => {
                appOutlets.main.innerHTML = res.html;
                _currentView = route.id;
                if (res.script) {
                    const script = document.createElement('script');
                    script.src = res.script;
                    appOutlets.main.appendChild(script);
                }

            })
        // then set this as the new DOM in the view node
        return;
    }
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
