/**
 * @typedef {object} RouteParams
 * @property {string} [key]
 */

/**
 * @typedef {object} RouteSearch
 * @property {string | string[]} [key]
 */

/**
 * @typedef {object} ViewOptions
 * @property {string} id
 * @property {string} [title]
 * @property {RouteParams} [params]
 * @property {RouteSearch} [search]
 */

/**
 * Defines the shape of a BaseView instance.
 * @typedef {object} BaseViewInstance
 * @property {string} id - The unique ID of this view instance.
 * @property {string | undefined} [title] - The title of the view.
 * @property {HTMLElement | undefined} viewEl - The main HTML element representing this view.
 * @property {() => void} viewWillLoad - Lifecycle hook called before the view is attached.
 * @property {() => void} viewDidLoad - Lifecycle hook called after the view is attached.
 * @property {() => void} viewWillUnload - Lifecycle hook called before the view is detached.
 * @property {() => void} viewDidUnload - Lifecycle hook called after the view is detached.
 * @property {() => void} destructor - Lifecycle hook called before the view is detached.
 * @property {(parentElement: HTMLElement) => void} attach - Attaches the view to a parent DOM element.
 * @property {() => void} detach - Detaches the view from the DOM.
 * @property {() => HTMLElement} render - Renders the view and returns its main HTML element.
 */

/**
 * @callback keydownCallback
 * @param {KeyboardEvent | MouseEvent} event
 */

// This file is only for type definitions, so it doesn't export any runtime code.
export {};