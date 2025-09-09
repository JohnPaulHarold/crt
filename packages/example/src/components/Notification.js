import { cx } from 'crt';
import { div } from '../html.js';

import s from './Notification.scss';

/**
 * @typedef {import('crt').ComponentProps & {
 *  message: string;
 * }} NotificationProps
 */

/**
 * @param {NotificationProps} props
 * @returns {HTMLElement}
 */
export function Notification(props) {
	const cxNotification = cx(s.notification, props.className || '');

	return /** @type {HTMLElement} */ (
		div(
			{
				className: cxNotification,
			},
			props.message
		)
	);
}
