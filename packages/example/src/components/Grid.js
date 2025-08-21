import { div, section } from '../h.js';

import s from './Grid.scss';

/**
 * @typedef {import('crt').ComponentProps & {
 *  columns: number
 * }} GridProps
 */

/**
 *
 * @param {GridProps} props
 * @param {HTMLElement[]} children
 * @returns {HTMLElement}
 */
export const Grid = (props, children) => {
	/**
	 * @type {HTMLElement[]}
	 */
	const gridRows = [];

	/**
	 * @type {HTMLElement}
	 */
	let rowEl;
	let rowCount = 0;

	children.forEach((c, i) => {
		if (i % props.columns === 0) {
			rowEl = div({ className: s.gridRow + ' row' + rowCount });
			gridRows.push(rowEl);
			rowCount++;
		}

		rowEl && rowEl.appendChild(c);
	});

	return section({ className: 'grid ' + props.className || '' }, gridRows);
};
