/**
 * @typedef {import('../declarations/types').CheckboxProps} CheckboxProps
 */

import { div, input, label, span } from '../libs/makeElement';

import s from './Checkbox.css';

/**
 * @name Checkbox
 * @param {CheckboxProps} props
 * @returns {HTMLElement}
 */
export function Checkbox(props) {
    return div(
        { className: s.checkbox },
        label(
            {
                tabIndex: 0,
                htmlFor: props.id,
            },
            input({
                id: props.id,
                type: 'checkbox',
                name: props.id,
            }),
            span(),
            props.label
        )
    );
}
