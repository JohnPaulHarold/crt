/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationsService } from './notifications.js';

describe('NotificationsService', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// The service's outlet needs to be in the document for querySelector to work
		document.body.appendChild(NotificationsService.outlet);
		// Reset the singleton's state before each test
		if (NotificationsService._resetForTesting) {
			NotificationsService._resetForTesting();
		}
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
		if (NotificationsService.outlet.parentElement) {
			document.body.removeChild(NotificationsService.outlet);
		}
	});

	test('sendNotification should enqueue a notification and set a timeout', () => {
		const notificationEl = document.createElement('div');
		notificationEl.textContent = 'Hello';

		NotificationsService.sendNotification(notificationEl);

		// Check queue state
		expect(NotificationsService.notificationsQueue.length()).toBe(1);
		expect(NotificationsService.notificationsQueue.getFront()).toBe(
			notificationEl
		);

		// Check internal state
		expect(NotificationsService.count).toBe(1);
		const hexId = '0';
		expect(notificationEl.dataset.notId).toBe(hexId);
		expect(NotificationsService.timers[hexId]).toBeDefined();

		// Check that clearNotification is called after 3 seconds
		const clearSpy = vi.spyOn(NotificationsService, 'clearNotification');
		vi.advanceTimersByTime(3000);
		expect(clearSpy).toHaveBeenCalledWith(hexId);
	});

	test('clearNotification should remove the element and clear the timer', () => {
		const notificationEl = document.createElement('div');
		notificationEl.textContent = 'Test';
		notificationEl.dataset.notId = 'a1';

		// Manually add to DOM and timers to test clearNotification in isolation
		NotificationsService.outlet.appendChild(notificationEl);
		const timerId = window.setTimeout(() => {}, 5000);
		NotificationsService.timers['a1'] = timerId;

		expect(NotificationsService.outlet.contains(notificationEl)).toBe(true);

		const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
		NotificationsService.clearNotification('a1');

		expect(NotificationsService.outlet.contains(notificationEl)).toBe(false);
		expect(NotificationsService.timers['a1']).toBeUndefined();
		expect(clearTimeoutSpy).toHaveBeenCalledWith(timerId);
	});

	test('batched queue should display notifications when flushed', () => {
		const el1 = document.createElement('div');
		el1.textContent = 'First';
		const el2 = document.createElement('div');
		el2.textContent = 'Second';

		NotificationsService.sendNotification(el1);
		NotificationsService.sendNotification(el2);

		// At this point, notifications are in the queue but not in the DOM
		expect(NotificationsService.outlet.children.length).toBe(0);

		// The queue has a batch interval of 100ms.
		vi.advanceTimersByTime(100);

		// Now they should be in the DOM
		expect(NotificationsService.outlet.children.length).toBe(2);
		expect(NotificationsService.outlet.children[0]).toBe(el1);
		expect(NotificationsService.outlet.children[1]).toBe(el2);
	});

	test('should handle clearing a notification that is not in the DOM', () => {
		const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
		NotificationsService.timers['b2'] = window.setTimeout(() => {}, 1000);

		// The element with data-not-id="b2" is not in the DOM
		expect(document.querySelector('[data-not-id="b2"]')).toBeNull();

		// Should not throw an error
		expect(() => NotificationsService.clearNotification('b2')).not.toThrow();

		// Should still clear the timer
		expect(clearTimeoutSpy).toHaveBeenCalled();
		expect(NotificationsService.timers['b2']).toBeUndefined();
	});

	test('should process a full queue immediately without waiting for timeout', () => {
		// Queue size is 5
		for (let i = 0; i < 5; i++) {
			NotificationsService.sendNotification(document.createElement('div'));
		}

		// The queue is now full, handleFull should have been called immediately
		expect(NotificationsService.outlet.children.length).toBe(5);
	});
});
