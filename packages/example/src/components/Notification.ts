import type { ComponentProps } from 'crt';

import { cx } from 'crt';
import { div } from '../html.js';

import s from './Notification.scss';

export type NotificationProps = ComponentProps & {
	message: string;
};

interface NotificationOptions {
	props: NotificationProps;
}

export function Notification(options: NotificationOptions): HTMLElement {
	const cxNotification = cx(s.notification, options.props.className || '');

	return div({
		props: { className: cxNotification },
		children: options.props.message,
	});
}
