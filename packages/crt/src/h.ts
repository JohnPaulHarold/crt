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
export type ChildInput =
	| string
	| Element
	| null
	| undefined
	| readonly ChildInput[];

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

export interface HOptions {
	props?: Record<string, unknown> | null;
	children?: ChildInput | readonly ChildInput[];
}

/**
 * @template K
 * @param type
 * @param options - Optional object containing props and children.
 * @see {@link https://david-gilbertson.medium.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff}
 *
 * @example h('div', { props: { id: 'foo' }, children: ['Hello', h('span', { children: 'World' })] })
 */
export function h<K extends keyof HTMLElementTagNameMap>(
	type: K,
	options?: HOptions
): HTMLElementTagNameMap[K] {
	const platform = getPlatform();
	const el = platform.createElement(type);
	const props = options?.props;
	const children = options?.children;

	if (props && typeof props === 'object') {
		Object.keys(props).forEach((propName) => {
			const value = props[propName];

			if (value == null) return; // Skip null and undefined values for cleaner output

			if (propName === 'style') {
				if (typeof value === 'object' && value !== null) {
					setStyles(el, value as Record<string, string | number>);
				}
			} else if (
				propName === 'dataset' &&
				typeof value === 'object' &&
				value !== null
			) {
				setData(el, value as Record<string, string>);
			} else if (
				propName === 'aria' &&
				typeof value === 'object' &&
				value !== null
			) {
				setAria(
					el,
					value as Record<string, string | number | boolean | undefined>
				);
			} else if (platform.isBrowser) {
				// Browser-specific logic
				if (propName in el) {
					// It's a known property on the element, so set it directly.
					(el as Record<string, unknown>)[propName] = value;
				} else if (attributeExceptions.includes(propName)) {
					// It's a known attribute that needs `setAttribute`.
					platform.setAttribute(el, propName, String(value));
				} else {
					logr.warn(`${propName} is not a valid property of a <${type}>`);
				}
			} else {
				// Server-specific logic: treat everything else as an attribute, but ignore event handlers.
				if (!propName.startsWith('on')) {
					// Ignore event handlers
					const attrName = propName === 'className' ? 'class' : propName;
					platform.setAttribute(el, attrName, String(value));
				}
			}
		});
	}

	// otherChildren is an array of ChildInput elements.
	if (children) {
		if (Array.isArray(children)) {
			appendArray(el, children);
		} else {
			appendArray(el, [children]);
		}
	}

	return el;
}

// Kept for compatibility
export const makeElement = h;
