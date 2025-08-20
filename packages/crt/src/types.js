/**
 * @typedef {object} ViewOptions
 * @property {string} id - A unique identifier for the view instance.
 * @property {string} [title] - An optional title for the view.
 * @property {Record<string, any>} [params] - Route parameters.
 * @property {Record<string, any>} [search] - Query string parameters.
 */

/**
 * @typedef {object} BaseViewInstance
 * @property {string} id - The unique identifier for the view instance.
 * @property {HTMLElement | null} viewEl - The root DOM element for the view.
 * @property {Record<string, any> | undefined} [params] - Route parameters.
 * @property {Record<string, any> | undefined} [search] - Query string parameters.
 * @property {() => void} [destructor] - Cleans up the view before it's detached.
 * @property {() => void} [viewDidLoad] - Called after the view's element is attached to the DOM.
 * @property {() => HTMLElement} render - Renders the view's DOM element.
 * @property {(parentEl: HTMLElement) => void} attach - Attaches the view to a parent element.
 * @property {() => void} detach - Detaches the view from the DOM.
 */

/**
 * @callback keydownCallback
 * @param {KeyboardEvent | MouseEvent} event
 */

export {};