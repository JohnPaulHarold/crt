import type { ComponentProps } from 'crt';
import { div, span } from '../html.js';

import s from './Tile.scss';

export type TileProps = ComponentProps & {
	title: string;
};

/**
 *
 * @param props
 */
export const Tile = (props: TileProps): HTMLElement => {
	return (
		div(
			{ className: `tile ${s.tile}`, id: 'title-' + props.id },
			span({}, props.title)
		)
	);
};
