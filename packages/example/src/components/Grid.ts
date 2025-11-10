import type { ComponentProps } from 'crt';
import { div, section } from '../html.js';

import s from './Grid.scss';

export type GridProps = ComponentProps & {
	columns: number;
};

interface GridOptions {
	props: GridProps;
	children: HTMLElement[];
}

/**
 *
 * @param props
 * @param children
 */
export const Grid = (options: GridOptions): HTMLElement => {
	const gridRows: HTMLElement[] = [];

	let rowEl: HTMLElement;
	let rowCount = 0;

	options.children.forEach((c, i) => {
		if (i % options.props.columns === 0) {
			rowEl = div({ props: { className: s.gridRow + ' row' + rowCount } });
			gridRows.push(rowEl);
			rowCount++;
		}

		if (rowEl) {
			rowEl.appendChild(c);
		}
	});

	return section({
		props: { className: 'grid ' + (options.props.className || '') },
		children: gridRows,
	});
};
