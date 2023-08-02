/**
 * @typedef {import('../declarations/types').TileProps} TileProps
 */

import { div, span } from '../libs/makeElement';

import s from './Tile.css';
/**
<<<<<<< HEAD
 *
 * @param {TileProps} props
 * @returns {Element}
=======
 * 
 * @param {TileProps} props 
 * @returns {HTMLElement}
>>>>>>> 929b6e1 ([crt/11] show page)
 */
export const Tile = (props) => {
    return div(
        { className: `tile ${s.tile}`, id: 'title-' + props.id },
        span({}, props.title)
    );
};
