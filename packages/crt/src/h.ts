import { loga } from './utils/loga/loga.js';
import { getPlatform } from './platform.js';

const logr = loga.create('h');

/**
 * Represents the types of input that can be considered a child or a collection of children
 * for an HTML element. This can be:
 * - A single string (for a text node).
 * - A single Element.
 * - An array containing strings, Elements, or other nested arrays of the same (any[] for deeper nesting).
 */
type ChildInput = string | Element | null | undefined | readonly ChildInput[];

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
 * @param thing The item to check.
 */
const isNodeLike = (thing: unknown): thing is Element =>
	typeof thing === 'object' &&
	thing !== null &&
	'tagName' in thing &&
	!Array.isArray(thing);

/**
 * @param el
 * @param text
 */
function appendText(el: Element, text: string) {
	const platform = getPlatform();
	const textNode = platform.createTextNode(text);
	platform.appendChild(el, textNode);
}

/**
 * @param el
 * @param children - An array of child elements.
 */
function appendArray(el: Element, children: readonly ChildInput[]) {
	const platform = getPlatform();
	children.forEach((child) => {
		if (Array.isArray(child)) {
			appendArray(el, child);
		} else if (isNodeLike(child)) {
			platform.appendChild(el, child); // isNodeLike acts as a type guard
		} else if (typeof child === 'string') {
			appendText(el, child);
		}
	});
}

/**
 * @param el
 * @param styles
 */
function setStyles(el: Element, styles: Record<string, string | number>) {
	const platform = getPlatform();
	// The platform implementation will handle the logic.
	// For the browser, this might be Object.assign(el.style, styles).
	// For the server, it will convert the object to a style string.
	platform.setStyles(el, styles);
}

/**
 * @param el
 * @param dataset
 */
function setData(el: Element, dataset: Record<string, string>) {
	const platform = getPlatform();
	platform.setData(el, dataset);
}

/**
 * Sets ARIA attributes on an element from an object.
 * @@param el The element to apply attributes to.
 * @param aria The object of ARIA attributes.
 */
function setAria(
	el: Element,
	aria: Record<string, string | number | boolean | undefined>
) {
	const platform = getPlatform();
	platform.setAria(el, aria);
}

/**
 * @template K
 * @param type
 * @param textOrPropsOrChild - Optional.
 *   Either an object of attributes/properties for the element,
 *   or the first child/collection of children (string, Element, or array of ChildInput).
 * @param otherChildren - Additional children to append. Each argument
 *   is treated as a child or a collection of children.
 * @see {@link https://david-gilbertson.medium.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff}
 *
 * @example h('div', { id: 'foo' }, 'Hello', h('span', 'World'))
 */
export function h<K extends keyof HTMLElementTagNameMap>(
	type: K,
	textOrPropsOrChild?: Record<string, unknown> | ChildInput | null,
	...otherChildren: readonly ChildInput[]
): HTMLElementTagNameMap[K] {
	const platform = getPlatform();
	const el = platform.createElement(type);

	if (Array.isArray(textOrPropsOrChild)) {
		appendArray(el, textOrPropsOrChild);
	} else if (isNodeLike(textOrPropsOrChild)) {
		platform.appendChild(el, textOrPropsOrChild); // isNodeLike acts as a type guard
	} else if (typeof textOrPropsOrChild === 'string') {
		appendText(el, textOrPropsOrChild);
	} else if (
		typeof textOrPropsOrChild === 'object' &&
		textOrPropsOrChild !== null
	) {
		const props = textOrPropsOrChild as Record<string, unknown>;
		Object.keys(props).forEach((propName) => {
			const value = props[propName];

			if (value == null) return; // Skip null and undefined values for cleaner output

			if (propName === 'style') {
				if (typeof value === 'object' && value !== null)
					setStyles(el, value as Record<string, string | number>);
			} else if (propName === 'dataset') {
				if (typeof value === 'object' && value !== null)
					setData(el, value as Record<string, string>);
			} else if (propName === 'aria') {
				if (typeof value === 'object' && value !== null)
					setAria(
						el,
						value as Record<string, string | number | boolean | undefined>
					);
			} else if (platform.isBrowser) {
				// Browser-specific logic
				if (propName in el) {
					// It's a known property on the element, so set it directly.
					// We cast to a record to allow this dynamic property access in a type-safe way.
					(el as Record<string, unknown>)[propName] = value;
				} else if (attributeExceptions.includes(propName)) {
					// It's a known attribute that needs `setAttribute`.
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
