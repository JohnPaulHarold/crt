import { cx } from 'crt';
import { div, span } from '../h.js';

import s from './Spinner.scss';

/**
 * @typedef {import('crt').ComponentProps & {
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
