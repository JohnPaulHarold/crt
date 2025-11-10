import type { ComponentProps } from 'crt';
import { div, span } from '../html.js';

import s from './Tile.scss';

export type TileProps = ComponentProps & {
	title: string;
};

interface TileOptions {
	props: TileProps;
}

/**
 *
 * @param props
 */
export const Tile = (options: TileOptions): HTMLElement => {
	return div({
		props: { className: `tile ${s.tile}`, id: 'title-' + options.props.id },
		children: span({ children: options.props.title }),
	});
};
