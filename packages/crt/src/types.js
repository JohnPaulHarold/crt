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
 */

/**
 * @typedef {object} BaseViewInstance
 * @property {string} id
 * @property {HTMLElement | null} viewEl
 * @property {(parentEl: HTMLElement) => void} attach
 * @property {() => void} detach
 * @property {() => HTMLElement} render
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

export {};
