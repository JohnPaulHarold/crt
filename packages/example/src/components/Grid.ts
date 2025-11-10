import type { ComponentProps } from 'crt';
import { div, section } from '../html.js';

import s from './Grid.scss';

export type GridProps = ComponentProps & {
	columns: number;
};

/**
 *
 * @param props
 * @param children
 */
export const Grid = (props: GridProps, children: HTMLElement[]): HTMLElement => {
	const gridRows: HTMLElement[] = [];

	let rowEl: HTMLElement;
	let rowCount = 0;

	children.forEach((c, i) => {
		if (i % props.columns === 0) {
			rowEl = (
				div({ className: s.gridRow + ' row' + rowCount })
			);
			gridRows.push(rowEl);
			rowCount++;
		}

		if (rowEl) {
			rowEl.appendChild(c);
		}
	});

	return (
		section({ className: 'grid ' + props.className || '' }, gridRows)
	);
};
