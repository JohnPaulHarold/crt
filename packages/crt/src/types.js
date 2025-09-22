/**
 * @typedef {object} ComponentProps
 * @property {string} [id]
 * @property {string} [className]
 * @property {Record<string, string>} [dataset]
 * @property {Partial<CSSStyleDeclaration>} [style]
 * @property {() => void} [onclick]
 * @property {() => void} [onfocus]
 * @property {() => void} [onblur]
 * @property {(event: KeyboardEvent) => void} [onkeydown]
 * @property {(event: KeyboardEvent) => void} [onkeyup]
 * @property {(event: KeyboardEvent) => void} [onkeypress]
 */

/**
 * @typedef {object} ViewOptions
 * @property {string} id
 * @property {string[]} [preserveAttributes] - A list of attribute names to preserve on elements within the DOM tree during a diff.
 */

/**
 * @typedef {object} BaseViewInstance
 * @property {string} id
 * @property {Element | null} viewEl
 * @property {string[]} preserveAttributes
 * @property {(parentEl: Element) => void} attach
 * @property {() => void} detach
 * @property {(element: Element) => void} hydrate
 * @property {() => Element} render
 * @property {() => void} [viewDidLoad]
 * @property {() => void} [destructor]
 */

/**
 * @typedef {object} SignallerInstance
 * @property {() => any} getValue - Gets the current value.
 * @property {(newValue: any) => void} setValue - Sets a new value and signals listeners if it changed.
 * @property {(callback: (instance: SignallerInstance) => void) => void} wait - Adds a callback to be called on the next change.
 * @property {(callback: (instance: SignallerInstance) => void) => void} unwait - Removes a callback.
 */

/**
 * @typedef {(event: KeyboardEvent | MouseEvent) => void} keydownCallback
 */

/**
 * @callback CreateTextNodeCallback
 * @param {string} text
 * @returns {Node}
 *
 * @callback CreateAppendChildCallback
 * @param {Node} parent
 * @param {Node} child
 *
 * @callback SetAttributeCallback
 * @param {Element} el
 * @param {string} name
 * @param {string} value
 *
 * @callback RemoveAttributeCallback
 * @param {Element} el
 * @param {string} name
 *
 * @callback RemoveChildCallback
 * @param {Node} parent
 * @param {Node} child
 *
 * @callback ReplaceChildCallback
 * @param {Node} parent
 * @param {Node} newChild
 * @param {Node} oldChild
 *
 * @callback SetStylesCallback
 * @param {Element} el
 * @param {Record<string, string | number>} styles
 *
 * @callback SetDataCallback
 * @param {Element} el
 * @param {Record<string, string>} dataset
 *
 * @callback SetAriaCallback
 * @param {Element} el
 * @param {Record<string, string | number | boolean | undefined>} aria
 *
 * @typedef {object} Platform
 * @property {boolean} isBrowser
 * @property {boolean} isServer
 * @property {<K extends keyof HTMLElementTagNameMap>(
 *  tagName: K
 * ) => HTMLElementTagNameMap[K]} createElement
 * @property {CreateTextNodeCallback} createTextNode
 * @property {CreateAppendChildCallback} appendChild
 * @property {SetAttributeCallback} setAttribute
 * @property {RemoveAttributeCallback} removeAttribute
 * @property {RemoveChildCallback} removeChild
 * @property {ReplaceChildCallback} replaceChild
 * @property {SetStylesCallback} setStyles
 * @property {SetDataCallback} setData
 * @property {SetAriaCallback} setAria
 */

/**
 * @typedef {window & {
 *  __INITIAL_DATA__?: Record<string, any>;
 * }} GlobalWindow
 */

export {};
