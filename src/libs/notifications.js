import { removeElement } from '../utils/dom/removeElement';
import { BatchedQueue } from './BatchedQueue';

function handleNotification() {
    console.log('[notifications][handleNotification]', arguments);
    const notifications = arguments[0];

    for (let index = 0; index < notifications.length; index++) {
        const notificationEl = notifications[index];
        NotificationsService.outlet.append(notificationEl);
    }
}

/**
 * @typedef {Object} NotificationsService
 * @property {HTMLElement} outlet
 * @property {number} count
 * @property {{ [index: string]: NodeJS.Timer }} timers
 * @property {*} notificationsQueue
 * @property {(el: HTMLElement) => void} sendNotification
 * @property {(id: string) => void} clearNotification
 */

/**
 * @type {NotificationsService}
 */
export const NotificationsService = {
    outlet: document.createElement('div'),
    count: 0,
    timers: {},
    notificationsQueue: new BatchedQueue(handleNotification, 100, 5),

    /**
     * @param {HTMLElement} el
     */
    sendNotification: function (el) {
        const that = this;
        const hex = that.count.toString(16);
        el.dataset.notId = hex;

        that.notificationsQueue.enqueue(el);

        that.count++;

        that.timers[hex] = (function (id) {
            return setTimeout(function () {
                /**
                 * @type {NotificationsService} this
                 */

                that.clearNotification(id);
            }, 3e3);
        })(hex);
    },

    /**
     *
     * @param {string} id
     */
    clearNotification: function (id) {
        const notificationToRemove = document.querySelector(
            '[data-not-id="' + id + '"]'
        );
        if (notificationToRemove instanceof HTMLElement) {
            removeElement(notificationToRemove);
        }
        clearTimeout(this.timers[id]);
        delete this.timers[id];
    },
};
