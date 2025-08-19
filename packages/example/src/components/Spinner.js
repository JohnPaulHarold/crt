import { div, span, cx } from 'crt';

import s from './Spinner.scss';

/**
 * @typedef {BaseComponentProps & {
 *  message?: string;
 * }} SpinnerProps
 */

/**
 * @param {SpinnerProps=} props
 * @returns {HTMLElement}
 */
export const Spinner = (props) => {
    const spinnerCx = cx(s.spinnerContainer, (props && props.className) || '');

    return div(
        {
            className: spinnerCx,
            id: (props && props.id) || '',
        },
        div(
            { className: s.spinnerInner },
            span(props && props.message ? props.message : 'Loading...')
        )
    );
};
