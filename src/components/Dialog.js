/**
 * @typedef {import('../declarations/types').DialogProps} DialogProps
 */

import { div, h1 } from '../libs/makeElement';
import { Button } from './Button';

import s from './Dialog.css';
/**
 *
 * @param {DialogProps} props
 * @param {HTMLElement | HTMLElement[]} children
 * @returns {HTMLElement}
 */
export function Dialog(props, children) {
    return div(
        { id: props.id, className: s.dialog },
        div(
            { className: s.dialogTitleContainer },
            Button({
                id: 'dialog-close',
                className: s.dialogClose,
                theme: 'none',
                text: 'X',
            }),
            props.title ? h1({ className: s.dialogTitle }, props.title) : ''
        ),
        div({ className: s.dialogContent }, children)
    );
}
