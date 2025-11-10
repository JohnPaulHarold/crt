import type { ComponentProps } from 'crt';

import { cx } from 'crt';
import { div } from '../html.js';

import s from './Notification.scss';

export type NotificationProps = ComponentProps & {
	message: string;
};

/**
 * @param props
 */
export function Notification(props: NotificationProps): HTMLElement {
	const cxNotification = cx(s.notification, props.className || '');

	return (
		div(
			{
				className: cxNotification,
			},
			props.message
		)
	);
}
