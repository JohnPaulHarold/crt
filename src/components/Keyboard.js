/**
 * @typedef {import('../declarations/types').KeyboardProps} KeyboardProps
 * @typedef {import('../declarations/types').KeyProps} KeyProps
 */

import { button, div } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';

import s from './Keyboard.css';
/**
 *
 * @param {KeyProps} props
 * @returns {HTMLElement}
 */
const KeyButton = (props) => {
    const buttonCx = cx(
        'keyboard-key',
        s.keyboardKey,
        typeof props.width === 'number' && s['w' + props.width]
    );

    return button(
        {
            className: buttonCx,
            dataset: {
                keyValue: props.value,
            },
        },
        props.display
    );
};

/**
 *
 * @param {KeyboardProps} props
 * @returns {HTMLElement}
 */
export const Keyboard = (props) => {
    return div(
        { className: s.keyboard },
        props.keyMap.map((row) =>
            div(
                { className: s.keyboardRow },
                row.map((key) => KeyButton(key))
            )
        )
    );
};
