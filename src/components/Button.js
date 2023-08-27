/**
 * @typedef {import('../declarations/types').ButtonProps} ButtonProps
 */

import { button } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';

import s from './Button.css';
/**
 *
 * @param {ButtonProps} props
 * @param {*} children
 * @returns {HTMLElement}
 */
export const Button = (props, children) => {
    const buttonCx = cx(s.button, props.className, props.ghost ? 'ghost' : '');

    return button(
        {
            className: buttonCx,
            dataset: props.dataset || {},
            id: props.id,
        },
        children
    );
};
