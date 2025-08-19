import { div, cx } from 'crt';

import s from './Notification.scss';

/**
 * @typedef {BaseComponentProps & { 
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
