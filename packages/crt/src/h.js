import { loga } from './utils/loga/loga.js';

const logr = loga.create('h');

/**
 * Represents the types of input that can be considered a child or a collection of children
 * for an HTML element. This can be:
 * - A single string (for a text node).
 * - A single HTMLElement.
 * - An array containing strings, HTMLElements, or other nested arrays of the same (any[] for deeper nesting).
 * @typedef {string | HTMLElement | Array<string | HTMLElement | any[]>} ChildInput
 */

/**
 * Type definition for the shorthand element creation functions (e.g., div, span).
 * @typedef {function(...any): HTMLElement} ShorthandMakeElement
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
 * @param {HTMLElement} el
 * @param {string} text
 */
function appendText(el, text) {
	const textNode = document.createTextNode(text);
	el.appendChild(textNode);
}

/**
 * @param {HTMLElement} el
 * @param {Array<string | Element | Array<any>>} children - An array of child elements.
 *   Each element can be a string (for a text node), an Element, or another array of children
 *   (allowing for nested structures). The `Array<any>` allows for deeper, less strictly-typed nesting
 *   if necessary, though the primary expectation is `string | Element`.
 */
function appendArray(el, children) {
	children.forEach((child) => {
		if (Array.isArray(child)) {
			appendArray(el, child);
		} else if (child instanceof window.Element) {
			el.appendChild(child);
		} else if (typeof child === 'string') {
			appendText(el, child);
		}
	});
}

/**
 * @param {HTMLElement} el
 * @param {CSSStyleDeclaration} styles
 * @returns
 */
function setStyles(el, styles) {
	if (!styles) {
		el.removeAttribute('styles');
		return;
	}

	Object.keys(styles).forEach((styleName) => {
		if (styleName in el.style) {
			// @ts-ignore see https://github.com/microsoft/TypeScript/issues/17827
			el.style[styleName] = styles[styleName];
		} else {
			logr.warn(
				`[setStyles] ${styleName} is not a valid style for a <${el.tagName.toLowerCase()}>`
			);
		}
	});
}

/**
 * @param {HTMLElement} el
 * @param {Record<string, string>} dataset
 */
function setData(el, dataset) {
	Object.keys(dataset).forEach((datakey) => {
		el.dataset[datakey] = dataset[datakey];
	});
}

/**
 * Sets ARIA attributes on an element from an object.
 * @param {HTMLElement} el The element to apply attributes to.
 * @param {Record<string, string | number | boolean | undefined>} aria The object of ARIA attributes.
 */
function setAria(el, aria) {
	Object.keys(aria).forEach((key) => {
		const value = aria[key];
		// Set the attribute only if the value is not null or undefined.
		if (value != null) el.setAttribute(`aria-${key}`, String(value));
	});
}

/**
 * @param {string} type
 * @param {Record<string, any> | ChildInput} [textOrPropsOrChild] - Optional.
 *   Either an object of attributes/properties for the element,
 *   or the first child/collection of children (string, HTMLElement, or array of ChildInput).
 * @param {ChildInput[]} otherChildren - Additional children to append. Each argument
 *   is treated as a child or a collection of children.
 * @see {@link https://david-gilbertson.medium.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff}
 *
 * @returns {HTMLElement}
 * @example h('div', { id: 'foo' }, 'Hello', h('span', 'World'))
 */
export function h(type, textOrPropsOrChild, ...otherChildren) {
	const el = document.createElement(type);

	if (Array.isArray(textOrPropsOrChild)) {
		appendArray(el, textOrPropsOrChild);
	} else if (textOrPropsOrChild instanceof window.Element) {
		el.appendChild(textOrPropsOrChild);
	} else if (typeof textOrPropsOrChild === 'string') {
		appendText(el, textOrPropsOrChild);
	} else if (
		typeof textOrPropsOrChild === 'object' &&
		textOrPropsOrChild !== null && // Ensure it's not null
		!Array.isArray(textOrPropsOrChild) // Ensure it's not an array (already handled)
	) {
		Object.keys(textOrPropsOrChild).forEach((propName) => {
			const value = textOrPropsOrChild[propName];

			if (value == null) return; // Skip null and undefined values for cleaner output

			if (propName === 'style') {
				setStyles(el, value);
			} else if (propName === 'dataset') {
				setData(el, value);
			} else if (propName === 'aria') {
				setAria(el, value);
			} else if (propName in el) {
				// It's a known property on the element, so set it directly.
				// @ts-ignore - We are intentionally setting a dynamic property.
				el[propName] = value;
			} else if (attributeExceptions.includes(propName)) {
				// It's a known exception (like 'role'), so use setAttribute.
				el.setAttribute(propName, String(value));
			} else {
				logr.warn(`${propName} is not a valid property of a <${type}>`);
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
