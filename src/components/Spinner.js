import { div, span } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';

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
