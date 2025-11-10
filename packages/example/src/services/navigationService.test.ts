/**
 * @vitest-environment jsdom
 */
import type { Mock } from 'vitest';

import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { navigationService, NavigationEvents } from './navigationService.js';

// Mock external dependencies to isolate the navigationService logic
vi.mock('@bbc/tv-lrud-spatial', () => ({
	getNextFocus: vi.fn(),
}));

vi.mock('../libs/deadSea.js', () => ({
	deadSeaService: {
		scrollAction: vi.fn(),
	},
}));

// Import mocks after vi.mock calls so we can control them
import { getNextFocus } from '@bbc/tv-lrud-spatial';
import { deadSeaService } from '../libs/deadSea.js';

describe('navigationService', () => {
	let container: HTMLElement | null = null;

	beforeEach(() => {
		// Create a sample DOM for each test
		document.body.innerHTML = `
            <div id="root">
                <nav id="nav">
                    <a href="#/home" id="nav-home">Home</a>
                    <a href="#/search" id="nav-search">Search</a>
                </nav>
                <main id="main">
                    <div id="view-container">
                        <button id="btn-1">Button 1</button>
                        <button id="btn-2">Button 2</button>
                    </div>
                </main>
            </div>
        `;
		container = document.getElementById('view-container');

		// Reset mocks before each test
		vi.clearAllMocks();

		// Reset the service's internal state and listeners for test isolation
		if (navigationService._resetForTesting) {
			navigationService._resetForTesting();
		}
	});

	afterEach(() => {
		// Clean up the DOM
		document.body.innerHTML = '';
	});

	describe('init', () => {
		test('should add keydown listener and focus the initial element', () => {
			const initialEl = document.getElementById('nav-home');
			if (!initialEl) {
				throw new Error('Test setup failed: #nav-home not found');
			}
			(getNextFocus as Mock).mockReturnValue(initialEl);

			const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

			navigationService.init();

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'keydown',
				expect.any(Function)
			);
			expect(getNextFocus).toHaveBeenCalledWith(null, -1);
			expect(initialEl.classList.contains('focused')).toBe(true);
			expect(deadSeaService.scrollAction).toHaveBeenCalledWith(initialEl, true);
		});
	});

	describe('moveFocus', () => {
		test('should move focus from one element to another', () => {
			const fromEl = document.getElementById('btn-1');
			const toEl = document.getElementById('btn-2');
			if (!fromEl || !toEl) {
				throw new Error('Test setup failed: button elements not found');
			}
			fromEl.classList.add('focused');

			navigationService.moveFocus(toEl, fromEl);

			expect(fromEl.classList.contains('focused')).toBe(false);
			expect(toEl.classList.contains('focused')).toBe(true);
			expect(deadSeaService.scrollAction).toHaveBeenCalledWith(toEl, true);
		});

		test('should clear previous focus if fromEl is not provided', () => {
			const otherFocusedEl = document.getElementById('nav-home');
			const toEl = document.getElementById('btn-1');

			if (!otherFocusedEl || !toEl) {
				throw new Error('Test setup failed: button elements not found');
			}
			otherFocusedEl.classList.add('focused');

			navigationService.moveFocus(toEl);

			expect(otherFocusedEl.classList.contains('focused')).toBe(false);
			expect(toEl.classList.contains('focused')).toBe(true);
		});
	});

	describe('focusInto', () => {
		test('should find and focus the first element in a scope', () => {
			const firstElInScope = document.getElementById('btn-1');
			if (!firstElInScope) {
				throw new Error('Test setup failed: #btn-1 not found');
			}
			(getNextFocus as Mock).mockReturnValue(firstElInScope);

			if (!container) {
				throw new Error('Test setup failed: container not found');
			}

			navigationService.focusInto(container);

			expect(getNextFocus).toHaveBeenCalledWith(null, -1, container);
			expect(firstElInScope.classList.contains('focused')).toBe(true);
		});
	});

	describe('Custom Focus Handler', () => {
		test('should allow registering and unregistering a custom keydown handler', () => {
			const customHandler = vi.fn();
			vi.useFakeTimers();

			// Note: The navigationService is a singleton that adds a global event listener.
			// For this test to work, we must initialize it to attach the listener.
			navigationService.init();

			const restoreDefault =
				navigationService.registerCustomFocusHandler(customHandler);

			// Simulate keydown event
			const event = new KeyboardEvent('keydown', { keyCode: 39 }); // Right arrow
			window.dispatchEvent(event);

			expect(customHandler).toHaveBeenCalled();

			// Restore the default handler
			restoreDefault();
			customHandler.mockClear();

			// Test that the default handler is now active by checking its effects
			const nextEl = document.getElementById('nav-search');
			if (!nextEl) {
				throw new Error('Test setup failed: #nav-search not found');
			}
			(getNextFocus as Mock).mockReturnValue(nextEl);

			window.dispatchEvent(event);

			expect(customHandler).not.toHaveBeenCalled();
			expect(getNextFocus).toHaveBeenCalled(); // Effect of default handler

			vi.useRealTimers();
		});
	});

	describe('Focus State Checkers', () => {
		test('isElementFocused and getCurrentFocus should report correct state', () => {
			const el = document.getElementById('btn-1');
			if (!el) {
				throw new Error('Test setup failed: #btn-1 not found');
			}

			expect(navigationService.isElementFocused('btn-1')).toBe(false);
			expect(navigationService.getCurrentFocus()).toBeUndefined();

			navigationService.moveFocus(el);

			expect(navigationService.isElementFocused('btn-1')).toBe(true);
			expect(navigationService.isElementFocused('btn-2')).toBe(false);

			const currentFocus = navigationService.getCurrentFocus();
			if (!currentFocus) {
				throw new Error('getCurrentFocus returned undefined unexpectedly');
			}

			expect(currentFocus).toBeDefined();
			expect(currentFocus.el).toBe(el);
			expect(currentFocus.id).toBe('btn-1');
		});
	});

	describe('Event Bus', () => {
		test('should emit a MOVE event on navigation', () => {
			const moveHandler = vi.fn();
			navigationService.getBus().on(NavigationEvents.MOVE, moveHandler);
			vi.useFakeTimers();

			// Note: The navigationService is a singleton that adds a global event listener.
			// For this test to work, we must initialize it to attach the listener.
			navigationService.init();

			const fromEl = document.getElementById('nav-home');
			const toEl = document.getElementById('nav-search');
			if (!fromEl || !toEl) {
				throw new Error('Test setup failed: nav elements not found');
			}

			// Set initial state by focusing the "from" element
			fromEl.focus();
			(getNextFocus as Mock).mockReturnValue(toEl);

			// Simulate a keydown event that triggers navigation
			const event = new KeyboardEvent('keydown', { keyCode: 39 }); // Right arrow
			window.dispatchEvent(event);

			expect(moveHandler).toHaveBeenCalledTimes(1);
			const eventPayload = moveHandler.mock.calls[0][0];
			expect(eventPayload.type).toBe(NavigationEvents.MOVE);
			expect(eventPayload.detail.direction).toBe('right');
			expect(eventPayload.detail.nextElement).toBe(toEl);

			vi.useRealTimers();
		});
	});
});
