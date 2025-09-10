/**
 * @file Contains the logic for rendering a view to an HTML string on the server.
 */

import { getPlatform, setPlatform } from '../platform.js';
import { serverPlatform } from './platform.js';

/**
 * Converts a camelCase string to kebab-case for CSS properties.
 * @param {string} str The string to convert.
 * @returns {string}
 */
const camelToKebab = (str) =>
	str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Converts a style object into an inline CSS string.
 * @param {Record<string, string | number>} style The style object.
 * @returns {string} The serialized style string.
 */
const styleObjectToString = (style) => {
	return Object.entries(style)
		.map(([key, value]) => `${camelToKebab(key)}:${value}`)
		.join(';');
};

/**
 * Converts an attributes object into a string of HTML attributes.
 * @param {Record<string, string>} attrs The attributes object.
 * @returns {string} The serialized attributes string.
 */
const attributesObjectToString = (attrs) => {
	return Object.entries(attrs)
		.map(([key, value]) => `${key}="${String(value).replace(/"/g, '&quot;')}"`)
		.join(' ');
};

/**
 * A set of HTML tags that are self-closing.
 * @type {Set<string>}
 */
const selfClosingTags = new Set(['img', 'input', 'br', 'hr', 'meta', 'link']);

/**
 * Recursively serializes a ServerNode object into an HTML string.
 * @param {import('./platform.js').ServerNode | string} node The node to serialize.
 * @returns {string} The resulting HTML string.
 */
function serializeNode(node) {
	if (typeof node === 'string') {
		return node; // It's a text node.
	}

	// STRATEGIC LOG 3: What attributes are being serialized for this node?
	console.log(`[serializeNode] Serializing <${node.tagName}> with attributes:`, node.attributes);

	const { tagName, attributes, style, children } = node;

	const attrsString = attributesObjectToString(attributes);
	const styleString = styleObjectToString(style);

	let finalAttrs = attrsString;
	if (styleString) {
		finalAttrs += `${finalAttrs ? ' ' : ''}style="${styleString}"`;
	}

	const openTag = `<${tagName}${finalAttrs ? ' ' : ''}${finalAttrs}>`;

	if (selfClosingTags.has(tagName.toLowerCase())) {
		return openTag;
	}

	const childrenHtml = children.map(serializeNode).join('');
	return `${openTag}${childrenHtml}</${tagName}>`;
}

/**
 * Renders a view instance to an HTML string.
 * @param {import('../types.js').BaseViewInstance} viewInstance The view instance to render.
 * @returns {string} The rendered HTML string.
 */
export function renderToString(viewInstance) {
	const originalPlatform = getPlatform();
	try {
		setPlatform(serverPlatform);
		const vdom = viewInstance.render();
		// STRATEGIC LOG 2: What does the complete VDOM tree look like?
		console.log(
			'[renderToString] Generated VDOM tree:',
			JSON.stringify(vdom, null, 2)
		);
		// @ts-ignore - The vdom is an `Element` type, but in this context it's a `ServerNode`.
		// We ignore the type checker here as we know the runtime type is correct.
		return serializeNode(vdom);
	} finally {
		setPlatform(originalPlatform);
	}
}
