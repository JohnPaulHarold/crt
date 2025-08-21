import { cx } from 'crt';
import { div } from '../h.js';

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

    return div(
        {
            className: cxNotification,
        },
        props.message
    );
}
