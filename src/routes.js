/**
 * @typedef {import('./declarations/types.js').ViewOptions} ViewOptions
 * @typedef {import('./declarations/types.js').Route} Route
 * @typedef {import('./declarations/types.js').RouteParams} RouteParams
 * @typedef {import('./declarations/types.js').RouteSearch} RouteSearch
 */
import { BaseView } from "./libs/baseView.js";

import { Home } from "./views/home.js";
import { Search } from "./views/search.js";
// import { Show } from './views/show.js';
import { appOutlets } from "./main.js";
import { Canivideo } from "./views/canivideo.js";

/** @type {BaseView} */
let _currentView;
/** @type {BaseView | null} */
let _nextView;

/**
 *
 * @param {BaseView} nextView
 */
function loadView(nextView) {
  const mainViewElement = document.getElementById(appOutlets.main.id);
  _nextView = nextView;
  mainViewElement && _nextView.attach(mainViewElement);

  if (_currentView) {
    _currentView.detach();
  }

  _currentView = _nextView;
  _nextView = null;
}

/**
 *
 * @param {{ route: Route, params: RouteParams, search: RouteSearch }} matchedRoute
 * @returns {void}
 */
export function handleViewChange(matchedRoute) {
  const View = matchedRoute.route.viewClass;
  const viewOptions = {
    id: matchedRoute.route.id,
    title: matchedRoute.route.title,
    params: matchedRoute.params,
    search: matchedRoute.search,
  };

  loadView(new View(viewOptions));

  return;
}

/** @type {Array<import('./declarations/types.js').Route>} */
export const routes = [
  // {
  //   pattern: '/show/{showId}',
  //   id: 'show',
  //   viewClass: Show,
  //   handler: handleViewChange
  // },
  // {
  //   pattern: '/show/{showId}/episode/{id}',
  //   id: 'nested',
  //   viewClass: Show,
  //   handler: handleViewChange
  // },
  {
    pattern: "/home",
    title: "Home",
    id: "home",
    default: true,
    viewClass: Home,
    handler: handleViewChange,
  },
  {
    pattern: "/search",
    title: "Search",
    id: "search",
    viewClass: Search,
    handler: handleViewChange,
  },
  {
    pattern: "/canivideo",
    title: "Can I video?",
    id: "canivideo",
    viewClass: Canivideo,
    handler: handleViewChange,
  },
];
