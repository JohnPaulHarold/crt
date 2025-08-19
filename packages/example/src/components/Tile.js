import { div, span } from '../h.js';

import s from './Tile.scss';

/**
 * @typedef {BaseComponentProps & {
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
