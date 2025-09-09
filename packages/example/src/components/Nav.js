import { a, li, nav, ul } from '../html.js';
import s from './Nav.scss';

/**
 * @typedef {object} NavItem
 * @property {string} id
 * @property {string} [title]
 * @property {string} href
 */

/**
 * @typedef {object} NavProps
 * @property {string} [blockExit]
 * @property {string} id
 * @property {NavItem[]} navItems
 * @property {boolean} [backStop]
 */

/**
 * @param {NavProps} props
 * @returns {HTMLElement}
 */
export function Nav({ id, navItems, blockExit, backStop }) {
	const dataset = {};
	if (blockExit) dataset.blockExit = blockExit;
	if (backStop) dataset.backStop = 'true';

	const props = Object.assign(
		{
			id,
			className: s.nav,
		},
		Object.keys(dataset).length && { dataset }
	);

	return /** @type {HTMLElement} */ (
		nav(
			props,
			ul(
				{},
				navItems.map((item) =>
					li({}, a({ href: item.href, id: item.id }, item.title))
				)
			)
		)
	);
}
