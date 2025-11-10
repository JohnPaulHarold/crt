import type { ComponentProps, ChildInput } from 'crt';

import { div } from '../html.js';

import { Button } from './Button.js';
import { Heading } from './Heading.js';

import s from './Dialog.scss';

type DialogProps = ComponentProps & {
	title?: string;
};

interface DialogOptions {
	props: DialogProps;
	children: ChildInput | readonly ChildInput[];
}

/**
 *
 * @param props
 * @param children
 */
export function Dialog(options: DialogOptions): HTMLElement {
	return div({
		props: { id: options.props.id, className: s.dialog },
		children: [
			div({
				props: { className: s.dialogTitleContainer },
				children: [
					Button({
						props: {
							id: 'dialog-close',
							className: s.dialogClose,
						},
						children: 'X',
					}),
					options.props.title
						? Heading({
								props: { level: 1, className: s.dialogTitle },
								children: options.props.title,
							})
						: '',
				],
			}),
			div({
				props: { className: s.dialogContent },
				children: options.children,
			}),
		],
	});
}
