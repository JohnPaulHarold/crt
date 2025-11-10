/**
 * @file Contains the logic for rendering a view to an HTML string on the server.
 */

import { getPlatform, setPlatform } from '../platform.js';
import type { BaseViewInstance } from '../types.js';
import { type ServerNode, serverPlatform } from './platform.js';

/**
 * Converts a camelCase string to kebab-case for CSS properties.
 * @param str The string to convert.
 */
const camelToKebab = (str: string): string =>
	str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Converts a style object into an inline CSS string.
 * @param style The style object.
 * @returns The serialized style string.
 */
const styleObjectToString = (
	style: Record<string, string | number>
): string => {
	return Object.entries(style)
		.map(([key, value]) => `${camelToKebab(key)}:${value}`)
		.join(';');
};

/**
 * Converts an attributes object into a string of HTML attributes.
 * @param attrs The attributes object.
 * @returns The serialized attributes string.
 */
const attributesObjectToString = (attrs: Record<string, string>): string => {
	return Object.entries(attrs)
		.map(([key, value]) => `${key}="${String(value).replace(/"/g, '&quot;')}"`)
		.join(' ');
};

/**
 * A set of HTML tags that are self-closing.
 */
const selfClosingTags: Set<string> = new Set([
	'img',
	'input',
	'br',
	'hr',
	'meta',
	'link',
]);

/**
 * Recursively serializes a ServerNode object into an HTML string.
 * @param node The node to serialize.
 * @returns The resulting HTML string.
 */
function serializeNode(node: ServerNode | string): string {
	if (typeof node === 'string') {
		return node; // It's a text node.
	}

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
 * @param viewInstance The view instance to render.
 * @returns The rendered HTML string.
 */
export function renderToString(viewInstance: BaseViewInstance): string {
	const originalPlatform = getPlatform();
	try {
		setPlatform(serverPlatform);
		const vdom = viewInstance.render();
		return serializeNode(vdom as unknown as ServerNode);
	} finally {
		setPlatform(originalPlatform);
	}
}
