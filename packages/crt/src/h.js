import { loga } from './utils/loga/loga.js';
import { getPlatform } from './platform.js';

const logr = loga.create('h');

/**
 * Represents the types of input that can be considered a child or a collection of children
 * for an HTML element. This can be:
 * - A single string (for a text node).
 * - A single Element.
 * - An array containing strings, Elements, or other nested arrays of the same (any[] for deeper nesting).
 * @typedef {string | Element | Array<string | Element | any[]>} ChildInput
 */

/**
 * @template {keyof HTMLElementTagNameMap} K
 * Type definition for the shorthand element creation functions (e.g., div, span).
 * @typedef {(...args: any[]) => HTMLElementTagNameMap[K]} ShorthandMakeElement<K>
 */

/**
 * A whitelist of valid HTML/SVG attributes that are not direct properties on
 * an element's prototype. These attributes must be set with `setAttribute`.
 * This is particularly useful for SVG attributes and attributes like 'for'
 * (which corresponds to the `htmlFor` property).
 */
const attributeExceptions = [
	// 'role' was previously here, but it's a direct property on HTMLElement,
	// so it's correctly handled by the `propName in el` check.
	'd',
	'r',
	'cx',
	'cy',
	'width',
	'height',
	'viewBox',
	'fill',
	'for',
];

/**
 * A duck-typing check to see if an object is a node-like structure.
 * This works for both browser HTMLElements and our server-side node objects,
 * as both are expected to have a `tagName` property.
 * @param {any} thing The item to check.
 * @returns {boolean}
 */
const isNodeLike = (thing) =>
	typeof thing === 'object' &&
	thing !== null &&
	'tagName' in thing &&
	!Array.isArray(thing);

/**
 * @param {Element} el
 * @param {string} text
 */
function appendText(el, text) {
	const platform = getPlatform();
	const textNode = platform.createTextNode(text);
	platform.appendChild(el, textNode);
}

/**
 * @param {Element} el
 * @param {Array<string | Element | Array<any>>} children - An array of child elements.
 */
function appendArray(el, children) {
	const platform = getPlatform();
	children.forEach((child) => {
		if (Array.isArray(child)) {
			appendArray(el, child);
		} else if (isNodeLike(child)) {
			// @ts-ignore - JSDoc checker struggles to narrow type with custom isNodeLike guard.
			platform.appendChild(el, child);
		} else if (typeof child === 'string') {
			appendText(el, child);
		}
	});
}

/**
 * @param {Element} el
 * @param {Record<string, string | number>} styles
 * @returns
 */
function setStyles(el, styles) {
	const platform = getPlatform();
	// The platform implementation will handle the logic.
	// For the browser, this might be Object.assign(el.style, styles).
	// For the server, it will convert the object to a style string.
	platform.setStyles(el, styles);
}

/**
 * @param {Element} el
 * @param {Record<string, string>} dataset
 */
function setData(el, dataset) {
	const platform = getPlatform();
	platform.setData(el, dataset);
}

/**
 * Sets ARIA attributes on an element from an object.
 * @param {Element} el The element to apply attributes to.
 * @param {Record<string, string | number | boolean | undefined>} aria The object of ARIA attributes.
 */
function setAria(el, aria) {
	const platform = getPlatform();
	platform.setAria(el, aria);
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} type
 * @param {Record<string, any> | ChildInput} [textOrPropsOrChild] - Optional.
 *   Either an object of attributes/properties for the element,
 *   or the first child/collection of children (string, Element, or array of ChildInput).
 * @param {ChildInput[]} otherChildren - Additional children to append. Each argument
 *   is treated as a child or a collection of children.
 * @see {@link https://david-gilbertson.medium.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff}
 *
 * @returns {HTMLElementTagNameMap[K]}
 * @example h('div', { id: 'foo' }, 'Hello', h('span', 'World'))
 */
export function h(type, textOrPropsOrChild, ...otherChildren) {
	const platform = getPlatform();
	const el = platform.createElement(type);

	if (Array.isArray(textOrPropsOrChild)) {
		appendArray(el, textOrPropsOrChild);
	} else if (isNodeLike(textOrPropsOrChild)) {
		// @ts-ignore - JSDoc checker struggles to narrow type with custom isNodeLike guard.
		platform.appendChild(el, textOrPropsOrChild);
	} else if (typeof textOrPropsOrChild === 'string') {
		appendText(el, textOrPropsOrChild);
	} else if (
		typeof textOrPropsOrChild === 'object' &&
		textOrPropsOrChild !== null
	) {
		Object.keys(textOrPropsOrChild).forEach((propName) => {
			// @ts-ignore - The preceding `if` checks ensure this is a props object, not an Element.
			const value = textOrPropsOrChild[propName];

			if (value == null) return; // Skip null and undefined values for cleaner output

			if (propName === 'style') {
				setStyles(el, value);
			} else if (propName === 'dataset') {
				setData(el, value);
			} else if (propName === 'aria') {
				setAria(el, value);
			} else if (platform.isBrowser) {
				// Browser-specific logic
				if (propName in el) {
					// It's a known property on the element, so set it directly.
					// @ts-ignore - We are intentionally setting a dynamic property.
					el[propName] = value;
				} else if (attributeExceptions.includes(propName)) {
					platform.setAttribute(el, propName, String(value));
				} else {
					logr.warn(`${propName} is not a valid property of a <${type}>`);
				}
			} else {
				// Server-specific logic: treat everything else as an attribute,
				// but ignore event handlers.
				if (!propName.startsWith('on')) {
					let attrName = propName;
					if (propName === 'className') {
						attrName = 'class';
					}
					platform.setAttribute(el, attrName, String(value));
				}
			}
		});
	}

	// otherChildren is an array of ChildInput elements.
	// appendArray expects a single array, so we pass otherChildren directly.
	// It will iterate through each ChildInput in otherChildren.
	if (otherChildren.length > 0) appendArray(el, otherChildren);

	return el;
}

// Kept for compatibility
export const makeElement = h;
