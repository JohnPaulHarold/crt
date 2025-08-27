import { div, span } from '../html.js';

import s from './Tile.scss';

/**
 * @typedef {import('crt').ComponentProps & {
 *  title: string;
 * }} TileProps
 */

/**
 *
 * @param {TileProps} props
 * @returns {Element}
 */
export const Tile = (props) => {
	return div(
		{ className: `tile ${s.tile}`, id: 'title-' + props.id },
		span({}, props.title)
	);
};
