/**
 * A very basic VDOM diffing engine.
 * This is not a full-featured implementation, but demonstrates the core concepts
 * needed to solve the focus-loss issue.
 */
import { getPlatform } from './platform.js';

/**
 * Diffs the attributes of two elements and updates the real DOM element.
 * @param {HTMLElement} vdom
 * @param {HTMLElement} dom
 */
function diffAttributes(vdom, dom) {
	// ::: Attributes
	const platform = getPlatform();
	const vdomAttrs = vdom.attributes;
	const domAttrs = dom.attributes;

	// Set new or changed attributes
	for (let i = 0; i < vdomAttrs.length; i++) {
		const attr = vdomAttrs[i];
		// Reading from the real DOM is fine, but writing should use the platform.
		if (dom.getAttribute(attr.name) !== attr.value)
			platform.setAttribute(dom, attr.name, attr.value);
	}

	// Remove old attributes
	for (let i = domAttrs.length - 1; i >= 0; i--) {
		const attr = domAttrs[i];
		if (!vdom.hasAttribute(attr.name)) platform.removeAttribute(dom, attr.name);
	}

	// ::: Properties
	// This is a targeted fix for properties that don't reflect as attributes,
	// like event handlers or the `value` of an input, which can become stale.
	// A more comprehensive VDOM implementation would track props explicitly.
	const propsToSync = [
		'onclick',
		'onkeydown',
		'onkeyup',
		'onkeypress',
		'onfocus',
		'onblur',
		'onchange',
		'onsubmit',
		'oninput',
		'value',
		'checked',
		'selected',
	];

	const anyDom = /** @type {any} */ (dom);
	const anyVdom = /** @type {any} */ (vdom);

	for (let i = 0; i < propsToSync.length; i++) {
		const prop = propsToSync[i];
		// Update property if it's different on the new VDOM.
		// This also handles removal, as a non-existent property on `vdom` will be
		// `undefined`, causing the property on `dom` to be set to `undefined`.
		// @ts-ignore - The type checker struggles with dynamic property access on DOM elements. This code is safe because we are iterating over a known list of valid properties.
		if (anyVdom[prop] !== anyDom[prop]) {
			// @ts-ignore - See above.
			anyDom[prop] = anyVdom[prop];
		}
	}
}

/**
 * Diffs the children of two elements and updates the real DOM element.
 * @param {HTMLElement} vdom
 * @param {HTMLElement} dom
 */
function diffChildren(vdom, dom) {
	const platform = getPlatform();
	const vdomChildren = Array.from(vdom.childNodes);
	const domChildren = Array.from(dom.childNodes);
	const maxLen = Math.max(vdomChildren.length, domChildren.length);

	for (let i = 0; i < maxLen; i++) {
		const vChild = vdomChildren[i];
		const dChild = domChildren[i];

		if (!vChild) {
			// The new VDOM has fewer children, so remove the extra real DOM node.
			if (dChild.parentNode) platform.removeChild(dChild.parentNode, dChild);
		} else if (!dChild) {
			// The new VDOM has more children, so add the new node.
			platform.appendChild(dom, vChild);
		} else {
			// Both nodes exist, so diff them recursively.
			_diff(vChild, dChild);
		}
	}
}

/**
 * The internal diffing function that recursively compares two nodes.
 * @param {Node} vdom
 * @param {Node} dom
 */
function _diff(vdom, dom) {
	const platform = getPlatform();
	// If the nodes are of different types or tags, replace the old with the new.
	if (vdom.nodeType !== dom.nodeType || vdom.nodeName !== dom.nodeName) {
		if (dom.parentNode) platform.replaceChild(dom.parentNode, vdom, dom);
		return;
	}

	// If they are text nodes, update the content if it's different.
	if (
		vdom.nodeType === Node.TEXT_NODE &&
		vdom.textContent !== dom.textContent
	) {
		dom.textContent = vdom.textContent;
		return;
	}

	// If they are element nodes, diff their attributes and children.
	if (vdom.nodeType === Node.ELEMENT_NODE) {
		// @ts-ignore - The type checker struggles to infer that after the `nodeType` check, vdom and dom are HTMLElements.
		diffAttributes(vdom, dom);
		// @ts-ignore - See above.
		diffChildren(vdom, dom);
	}
}

/**
 * Removes script tags from an element.
 * @param {HTMLElement} elem
 */
function removeScripts(elem) {
	const platform = getPlatform();
	const scripts = elem.querySelectorAll('script');
	for (let i = 0, l = scripts.length; i < l; i++) {
		const script = scripts[i];
		const parentNode = script.parentNode;
		if (parentNode !== null) platform.removeChild(parentNode, script);
	}
}

/**
 * @typedef {object} DiffOptions
 * @property {string[]} [preserveAttributes] - A list of attribute names to preserve on elements within the DOM tree during a diff.
 */

/**
 * Public diff function that wraps the core logic with focus management.
 * @param {Node} vdom
 * @param {Node} dom
 * @param {DiffOptions} [options={}]
 */
export function diff(vdom, dom, options = {}) {
	const platform = getPlatform();
	// Sanitize VDOM by removing script tags before diffing.
	if (vdom.nodeType === Node.ELEMENT_NODE) {
		// @ts-ignore - The type checker struggles to infer that after the `nodeType` check, vdom is an HTMLElement.
		removeScripts(vdom);
	}

	// ::: State Preservation
	// Before diffing, we need to "bookmark" any state that is imperatively
	// managed by external libraries directly on the DOM, so we can restore it.

	// 1a. Preserve visual focus state (`.focused` class).
	// The `navigationService` uses the `.focused` class as the source of truth for visual focus.
	let focusedElementId = null;
	/** @type {Record<string, Record<string, string>>} */
	const preservedAttributeState = {};
	const attributesToPreserve = options.preserveAttributes || [];

	if (platform.isBrowser) {
		const focusedElement = document.querySelector('.focused');
		// Ensure the focused element is within the DOM tree being diffed.
		if (focusedElement && dom.contains(focusedElement) && focusedElement.id) {
			focusedElementId = focusedElement.id;
		}

		// 1b. Preserve any additional specified attributes.
		if (dom instanceof Element) {
			attributesToPreserve.forEach((attrName) => {
				const elements = dom.querySelectorAll(`[${attrName}]`);
				elements.forEach((el) => {
					if (el.id) {
						preservedAttributeState[el.id] =
							preservedAttributeState[el.id] || {};
						const value = el.getAttribute(attrName);
						if (value !== null) {
							preservedAttributeState[el.id][attrName] = value;
						}
					}
				});
			});
		}
	}

	// 2. Perform the actual diffing.
	_diff(vdom, dom);

	// ::: State Restoration
	if (platform.isBrowser) {
		// 3a. Restore visual focus state.
		if (focusedElementId) {
			const newElementToFocus = document.getElementById(focusedElementId);
			if (newElementToFocus) {
				newElementToFocus.classList.add('focused');
				newElementToFocus.focus();
			}
		}

		// 3b. Restore preserved attributes.
		Object.keys(preservedAttributeState).forEach((elementId) => {
			const el = document.getElementById(elementId);
			if (el) {
				const attrsToRestore = preservedAttributeState[elementId];
				Object.keys(attrsToRestore).forEach((attrName) => {
					el.setAttribute(attrName, attrsToRestore[attrName]);
				});
			}
		});
	}
}

/**
 * Converts an HTML string into a single DOM element.
 * @param {string} html
 * @returns {Node | null}
 */
export function stringToHTML(html) {
	// This is a browser/DOM-only utility. It should not be used on the server.
	if (typeof document === 'undefined') {
		return null;
	}
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild;
}
