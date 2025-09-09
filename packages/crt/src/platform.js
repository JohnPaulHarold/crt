/**
 * @file Platform abstraction for DOM manipulation.
 */

/**
 * The browser-native implementation of the platform interface.
 * It directly uses the `document` and `window` objects.
 * @type {import("./types").Platform}
 */
const browserPlatform = {
	isBrowser: true,
	isServer: false,
	createElement: (tagName) => document.createElement(tagName),
	createTextNode: (text) => document.createTextNode(text),
	appendChild: (parent, child) => void parent.appendChild(child),
	setAttribute: (el, name, value) => el.setAttribute(name, value),
	removeAttribute: (el, name) => el.removeAttribute(name),
	removeChild: (parent, child) => parent.removeChild(child),
	replaceChild: (parent, newChild, oldChild) =>
		parent.replaceChild(newChild, oldChild),
	setStyles: (el, styles) => {
		// The `style` property is available on both HTMLElement and SVGElement
		// via the ElementCSSInlineStyle mixin, but not on the base Element.
		// We use `instanceof` to give TypeScript a more specific type.
		if (el instanceof HTMLElement || el instanceof SVGElement) {
			Object.assign(el.style, styles);
		}
	},
	setData: (el, dataset) => {
		// The `dataset` property is only available on HTMLElement.
		if (el instanceof HTMLElement) {
			Object.assign(el.dataset, dataset);
		}
	},
	setAria: (el, aria) => {
		Object.keys(aria).forEach((key) => {
			const value = aria[key];
			if (value != null) el.setAttribute(`aria-${key}`, String(value));
		});
	},
	// Add other DOM methods here as they are needed...
};

/**
 * The currently active platform. Defaults to the browser implementation.
 * @type {import("./types").Platform}
 */
let currentPlatform = browserPlatform;

/**
 * Gets the currently active platform implementation.
 * @returns {import("./types").Platform}
 */
export function getPlatform() {
	return currentPlatform;
}

/**
 * Sets the active platform implementation.
 * @param {import("./types").Platform} platform The platform to use (e.g., browserPlatform or serverPlatform).
 */
export function setPlatform(platform) {
	currentPlatform = platform;
}
