import type { ComponentProps } from 'crt';
import { cx } from 'crt';
import { div, span } from '../html.js';

import s from './Spinner.scss';

export type SpinnerProps = ComponentProps & {
	message?: string;
};

/**
 * @param props
 */
export const Spinner = (props: SpinnerProps | undefined): HTMLElement => {
	const spinnerCx = cx(s.spinnerContainer, (props && props.className) || '');

	return (
		div(
			{
				className: spinnerCx,
				id: (props && props.id) || '',
			},
			div(
				{ className: s.spinnerInner },
				span(props && props.message ? props.message : 'Loading...')
			)
		)
	);
};
