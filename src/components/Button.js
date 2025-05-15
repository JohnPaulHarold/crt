/**
 * @typedef {BaseComponentProps & {
 *  text?: string
 *  ghost?: boolean
 *  icon?: string
 *  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
 * }} ButtonProps
 */

import { button } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';

import s from './Button.scss';
/**
 *
 * @param {ButtonProps} props
 * @param {string | HTMLElement} children
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
