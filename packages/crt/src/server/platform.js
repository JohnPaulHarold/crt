/**
 * @file Server-side implementation of the platform interface.
 */

/**
 * A simple in-memory representation of a DOM element for server-side rendering.
 * @typedef {object} ServerNode
 * @property {string} tagName
 * @property {Record<string, string>} attributes
 * @property {Record<string, string | number>} style
 * @property {Array<ServerNode | string>} children
 */

/**
 * The server-side implementation of the platform interface.
 * It builds an in-memory tree of ServerNode objects instead of a real DOM.
 * This tree can then be stringified into HTML.
 * @type {import("../types").Platform}
 */
export const serverPlatform = {
	isBrowser: false,
	isServer: true,

	/** @returns {any} */
	// We cast the return to `any` to satisfy the `Element` return type of the Platform interface.
	createElement: (tagName) =>
		/** @type {ServerNode} */ ({
			tagName,
			attributes: {},
			style: {},
			children: [],
		}),

	// We cast the return to `any` to satisfy the `Node` return type of the Platform interface.
	createTextNode: (text) => /** @type {any} */ (String(text)),

	appendChild: (parent, child) => {
		// Double-cast via `any` to convert from DOM types to our ServerNode type.
		/** @type {ServerNode} */ (/** @type {any} */ (parent)).children.push(
			/** @type {ServerNode | string} */ (/** @type {any} */ (child))
		);
	},

	setAttribute: (el, name, value) => {
		/** @type {ServerNode} */ (/** @type {any} */ (el)).attributes[name] =
			String(value);
	},

	removeAttribute: (el, name) => {
		delete (
			/** @type {ServerNode} */ (/** @type {any} */ (el)).attributes[name]
		);
	},

	removeChild: (parent, child) => {
		const serverParent = /** @type {ServerNode} */ (
			/** @type {any} */ (parent)
		);
		const index = serverParent.children.indexOf(
			/** @type {ServerNode | string} */ (/** @type {any} */ (child))
		);
		if (index > -1) {
			serverParent.children.splice(index, 1);
		}
	},

	replaceChild: (parent, newChild, oldChild) => {
		const serverParent = /** @type {ServerNode} */ (
			/** @type {any} */ (parent)
		);
		const index = serverParent.children.indexOf(
			/** @type {ServerNode | string} */ (/** @type {any} */ (oldChild))
		);
		if (index > -1) {
			serverParent.children[index] = /** @type {ServerNode | string} */ (
				/** @type {any} */ (newChild)
			);
		}
	},

	setStyles: (el, styles) => {
		Object.assign(
			/** @type {ServerNode} */ (/** @type {any} */ (el)).style,
			styles
		);
	},

	setData: (el, dataset) => {
		Object.keys(dataset).forEach((key) => {
			/** @type {ServerNode} */ (/** @type {any} */ (el)).attributes[
				`data-${key}`
			] = String(dataset[key]);
		});
	},

	setAria: (el, aria) => {
		Object.keys(aria).forEach((key) => {
			const value = aria[key];
			if (value != null) {
				/** @type {ServerNode} */ (/** @type {any} */ (el)).attributes[
					`aria-${key}`
				] = String(value);
			}
		});
	},
};
