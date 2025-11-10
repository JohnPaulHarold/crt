import { removeElement, loga } from 'crt';
import { createBatchedQueue } from './BatchedQueue.js';

const logr = loga.create('notifications');

/**
 * @param {HTMLElement[]} notifications
 */
function handleNotification(notifications) {
	logr.log('[handleNotification]', notifications);

	for (const notificationEl of notifications) {
		NotificationsService.outlet.append(notificationEl);
	}
}

/**
 * @typedef {Object} NotificationsService
 * @property {HTMLElement} outlet
 * @property {number} count
 * @property {Record<string, number | undefined | NodeJS.Timeout>} timers
 * @property {import('./BatchedQueue.js').BatchedQueueInstance<HTMLElement>} notificationsQueue
 * @property {(el: HTMLElement) => void} sendNotification
 * @property {(id: string) => void} clearNotification
 * @property {() => void} [_resetForTesting]
 */

/**
 * @type {NotificationsService}
 */
export const NotificationsService = {
	outlet: document.createElement('div'),
	count: 0,
	timers: {},
	notificationsQueue: createBatchedQueue(handleNotification, 100, 5),

	/**
	 * @param {HTMLElement} el
	 */
	sendNotification: function (el) {
		const hex = this.count.toString(16);
		el.dataset.notId = hex;

		this.notificationsQueue.enqueue(el);

		this.count++;

		this.timers[hex] = setTimeout(() => {
			this.clearNotification(hex);
		}, 3000);
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

	/**
	 * Resets the service's state for test isolation.
	 * This method is only available in a test environment.
	 */
	_resetForTesting:
		process.env.NODE_ENV === 'test'
			? function () {
					// Referencing the service directly avoids ambiguity with `this` context,
					// which resolves the TypeScript errors.
					if (
						NotificationsService.notificationsQueue &&
						NotificationsService.notificationsQueue.clearSweep
					) {
						NotificationsService.notificationsQueue.clearSweep();
					}
					NotificationsService.outlet.innerHTML = '';
					NotificationsService.count = 0;
					for (const timerId in NotificationsService.timers) {
						clearTimeout(NotificationsService.timers[timerId]);
					}
					NotificationsService.timers = {};
					NotificationsService.notificationsQueue = createBatchedQueue(
						handleNotification,
						100,
						5
					);
				}
			: undefined,
};
