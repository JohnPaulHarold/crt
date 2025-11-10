/**
 * @file Server-side implementation of the platform interface.
 */

import type { Platform } from '../types.js';

/**
 * A simple in-memory representation of a DOM element for server-side rendering.
 */
export interface ServerNode {
	tagName: string;
	attributes: Record<string, string>;
	style: Record<string, string | number>;
	children: Array<ServerNode | string>;
}

/**
 * The server-side implementation of the platform interface.
 * It builds an in-memory tree of ServerNode objects instead of a real DOM.
 * This tree can then be stringified into HTML.
 */
export const serverPlatform: Platform = {
	isBrowser: false,
	isServer: true,

	createElement: <K extends keyof HTMLElementTagNameMap>(
		tagName: K
	): HTMLElementTagNameMap[K] => {
		return {
			tagName,
			attributes: {},
			style: {},
			children: [],
		} as unknown as HTMLElementTagNameMap[K];
	},

	createTextNode: (text: string): Node => {
		return String(text) as unknown as Node;
	},

	appendChild: (parent: Node, child: Node) => {
		(parent as unknown as ServerNode).children.push(
			child as unknown as ServerNode | string
		);
	},

	setAttribute: (el: Element, name: string, value: string) => {
		(el as unknown as ServerNode).attributes[name] = String(value);
	},

	removeAttribute: (el: Element, name: string) => {
		delete (el as unknown as ServerNode).attributes[name];
	},

	removeChild: (parent: Node, child: Node) => {
		const serverParent = parent as unknown as ServerNode;
		const index = serverParent.children.indexOf(
			child as unknown as ServerNode | string
		);
		if (index > -1) {
			serverParent.children.splice(index, 1);
		}
	},

	replaceChild: (parent: Node, newChild: Node, oldChild: Node) => {
		const serverParent = parent as unknown as ServerNode;
		const index = serverParent.children.indexOf(
			oldChild as unknown as ServerNode | string
		);
		if (index > -1) {
			serverParent.children[index] = newChild as unknown as ServerNode | string;
		}
	},

	setStyles: (el: Element, styles: Record<string, string | number>) => {
		Object.assign((el as unknown as ServerNode).style, styles);
	},

	setData: (el: Element, dataset: Record<string, string>) => {
		Object.keys(dataset).forEach((key) => {
			const value = dataset[key];
			if (value != null) {
				(el as unknown as ServerNode).attributes[`data-${key}`] = String(value);
			}
		});
	},

	setAria: (
		el: Element,
		aria: Record<string, string | number | boolean | undefined | null>
	) => {
		Object.keys(aria).forEach((key) => {
			const value = aria[key];
			if (value != null) {
				(el as unknown as ServerNode).attributes[`aria-${key}`] = String(value);
			}
		});
	},
};
