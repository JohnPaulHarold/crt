/**
 * @typedef {import('../declarations/types').TileProps} TileProps
 */

import { div, span } from '../libs/makeElement';

import s from './Tile.scss';
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
