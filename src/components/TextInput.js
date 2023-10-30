/**
 * @typedef {import('../declarations/types').TextInputProps} TextInputProps
 */

import { div, label, input } from '../libs/makeElement';

import s from './TextInput.scss';

/**
 * @name TextInput
 * @param {TextInputProps} props
 * @returns {HTMLElement}
 */
export function TextInput(props) {
    return div(
        {
            className: s.textInput,
        },
        label(
            {},
            input({
                type: 'text',
                name: props.id,
            }),
            props.label
        )
    );
}
