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
	createElement: (tagName) => {
		// @ts-ignore - The return type is a ServerNode, not a DOM Element.
		return {
			tagName,
			attributes: {},
			style: {},
			children: [],
		};
	},

	// @ts-ignore - The return type is a string, not a DOM Node.
	createTextNode: (text) => {
		// @ts-ignore - The return type is a string, not a DOM Node.
		return String(text);
	},

	appendChild: (parent, child) => {
		// @ts-ignore - The Platform interface uses DOM types, but we know these are ServerNodes at runtime.
		parent.children.push(child);
	},

	setAttribute: (el, name, value) => {
		// @ts-ignore - el is a ServerNode at runtime.
		el.attributes[name] = String(value);
	},

	removeAttribute: (el, name) => {
		// @ts-ignore - el is a ServerNode at runtime.
		delete el.attributes[name];
	},

	removeChild: (parent, child) => {
		// @ts-ignore - parent is a ServerNode at runtime.
		const index = parent.children.indexOf(child);
		if (index > -1) {
			// @ts-ignore - parent is a ServerNode at runtime.
			parent.children.splice(index, 1);
		}
	},

	replaceChild: (parent, newChild, oldChild) => {
		// @ts-ignore - parent is a ServerNode at runtime.
		const index = parent.children.indexOf(oldChild);
		if (index > -1) {
			// @ts-ignore - parent is a ServerNode at runtime.
			parent.children[index] = newChild;
		}
	},

	setStyles: (el, styles) => {
		// @ts-ignore - el is a ServerNode at runtime.
		Object.assign(el.style, styles);
	},

	setData: (el, dataset) => {
		Object.keys(dataset).forEach((key) => {
			const value = dataset[key];
			if (value != null) {
				// @ts-ignore - el is a ServerNode at runtime.
				el.attributes[`data-${key}`] = String(value);
			}
		});
	},

	setAria: (el, aria) => {
		Object.keys(aria).forEach((key) => {
			const value = aria[key];
			if (value != null) {
				// @ts-ignore - el is a ServerNode at runtime.
				el.attributes[`aria-${key}`] = String(value);
			}
		});
	},
};
