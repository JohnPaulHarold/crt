/**
 * @typedef {import('../declarations/types').ButtonProps} ButtonProps
 */

import { button, span } from '../libs/makeElement';

import s from './Button.css';
/**
 *
 * @param {ButtonProps} props
 * @returns {HTMLElement}
 */
export const Button = (props) => {
    return button(
        { className: `${s.button}`, id: 'button-' + props.id },
        span({ className: s.buttonText }, props.text)
    );
};
