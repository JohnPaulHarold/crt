import type { ComponentProps } from 'crt';
import { cx } from 'crt-utils';
import { div, span } from '../html.js';

import s from './Spinner.scss';

export type SpinnerProps = ComponentProps & {
	message?: string;
};

interface SpinnerOptions {
	props?: SpinnerProps;
}

export const Spinner = (options?: SpinnerOptions): HTMLElement => {
	const spinnerCx = cx(s.spinnerContainer, options?.props?.className || '');

	return div({
		props: {
			className: spinnerCx,
			id: options?.props?.id || '',
		},
		children: div({
			props: { className: s.spinnerInner },
			children: span({
				children: options?.props?.message
					? options.props.message
					: 'Loading...',
			}),
		}),
	});
};
