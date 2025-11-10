import type { ComponentProps } from 'crt';

import { div } from '../html.js';

import { Button } from './Button.js';
import { Heading } from './Heading.js';

import s from './Dialog.scss';

type DialogProps = ComponentProps & {
	title?: string;
};

/**
 *
 * @param props
 * @param children
 */
export function Dialog(props: DialogProps, children: HTMLElement | HTMLElement[]): HTMLElement {
	return (
		div(
			{ id: props.id, className: s.dialog },
			div(
				{ className: s.dialogTitleContainer },
				Button(
					{
						id: 'dialog-close',
						className: s.dialogClose,
					},
					'X'
				),
				props.title
					? Heading(
							{
								level: 1,
								className: s.dialogTitle,
							},
							props.title
						)
					: ''
			),
			div({ className: s.dialogContent }, children)
		)
	);
}
