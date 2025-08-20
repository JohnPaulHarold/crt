/**
 * @vitest-environment jsdom
 */

import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'; // Adjusted path
import { historyRouter } from './router.js'; // Assuming this is the exported router object

// Helper to reset router state if needed, though re-config in beforeEach is often enough
const resetRouterState = () => {
	historyRouter.handlers = {};
	historyRouter.basePath = '';
	historyRouter.mode = 'history'; // Default mode
	historyRouter.hashSymbol = '#';
	// Note: Event listeners on `window` added by `setupListeners` are not easily removed
	// without storing references, which the router doesn't do.
	// For testing, re-initializing via `config` in `beforeEach` is usually sufficient
	// as the router's internal logic will use the latest config.
};

describe('historyRouter', () => {
	beforeEach(() => {
		// Reset parts of the global state that the router interacts with
		window.location.hash = '';
		// Reset path to root for history mode tests
		window.history.replaceState({}, '', '/');
		resetRouterState(); // Reset internal router state
	});

	afterEach(() => {
		vi.restoreAllMocks(); // Restore any mocks
	});

	describe('hash mode', () => {
		test('it registers handlers and responds to hashchange', () => {
			const mockComposeFunc = vi.fn();
			const mockCallback = vi.fn();
			const routeId = 'xyz';
			const routeDefinition = {
				title: 'XYZ',
				pattern: `/${routeId}`,
				id: routeId,
				composeFunction: mockComposeFunc, // Using composeFunction as per router.js Route type
			};

			// Configure for hash mode
			historyRouter.config('/', 'hash', '#');
			historyRouter.registerRoute(routeDefinition, mockCallback);

			// Simulate hash change
			const newHashUrl =
				window.location.origin + window.location.pathname + `#/${routeId}`;
			const hashChangeEvent = new HashChangeEvent('hashchange', {
				newURL: newHashUrl,
				oldURL: window.location.href,
			});
			window.dispatchEvent(hashChangeEvent);

			const expectedArgs = {
				params: {},
				search: {},
				pattern: `/${routeId}`,
				state: {},
			};
			expect(mockCallback).toHaveBeenCalledWith(expectedArgs);
		});

		test('it handles a custom hash symbol', () => {
			const mockComposeFunc = vi.fn();
			const mockCallback = vi.fn();
			const routeId = 'customHashRoute';
			const customHashSymbol = '!@';
			const routeDefinition = {
				pattern: `/${routeId}`,
				title: 'Custom Hash Route',
				id: routeId,
				composeFunction: mockComposeFunc,
			};

			historyRouter.config('/', 'hash', customHashSymbol);
			historyRouter.registerRoute(routeDefinition, mockCallback);

			// Correctly form the newURL as the browser would see it for a hash change
			const newHashUrl =
				window.location.origin +
				window.location.pathname +
				`#${customHashSymbol}/${routeId}`;
			const hashChangeEvent = new HashChangeEvent('hashchange', {
				newURL: newHashUrl,
				oldURL: window.location.href,
			});
			window.dispatchEvent(hashChangeEvent);

			const expectedArgs = {
				params: {},
				search: {},
				pattern: `/${routeId}`,
				state: {},
			};
			expect(mockCallback).toHaveBeenCalledWith(expectedArgs);
		});

		test('programmatic navigation updates hash and triggers handler', () => {
			// Test returns a Promise
			const routeId = 'progNavHash';
			/** @type {*} */
			let capturedArgs = null;

			// Create a promise that resolves when the callback is called
			const callbackCalledPromise = new Promise((resolve) => {
				const mockCallback = vi.fn((args) => {
					capturedArgs = args; // Capture arguments for assertion
					resolve(undefined); // Resolve the promise indicating the callback was hit
				});

				historyRouter.config('/', 'hash');
				historyRouter.registerRoute(
					{
						title: 'Programmatic Nav Hash',
						pattern: `/${routeId}`,
						id: routeId,
						composeFunction: vi.fn(),
					},
					mockCallback
				);

				// This part is synchronous
				expect(window.location.hash).toBe(''); // Assert initial state if needed

				historyRouter.navigate(`/${routeId}`);

				// This part is also synchronous
				expect(window.location.hash).toBe(`#/${routeId}`);
			});

			return callbackCalledPromise.then(() => {
				// This block executes after the mockCallback has been called
				expect(capturedArgs).toEqual(
					expect.objectContaining({ pattern: `/${routeId}` })
				);
			});
		});
	});

	describe('history mode', () => {
		/** @type {*} */
		let pushStateSpy;

		beforeEach(() => {
			pushStateSpy = vi.spyOn(window.history, 'pushState');
			historyRouter.config('/', 'history'); // Default config for most history tests
		});

		test('it processes initial path on load', () => {
			const mockCallback = vi.fn();
			const routeId = 'initial';
			// Set initial path
			window.history.replaceState({}, '', `/${routeId}`);

			// Config will call init, which processes current path
			historyRouter.config('/', 'history');
			historyRouter.registerRoute(
				{ pattern: `/${routeId}`, id: routeId, composeFunction: vi.fn() },
				mockCallback
			);

			expect(mockCallback).toHaveBeenCalledWith(
				expect.objectContaining({ pattern: `/${routeId}` })
			);
		});

		test('programmatic navigation updates URL and triggers handler', () => {
			const mockCallback = vi.fn();
			const routeId = 'progNavHistory';
			const path = `/${routeId}`;
			const state = { testState: true };

			historyRouter.registerRoute(
				{ pattern: path, id: routeId, composeFunction: vi.fn() },
				mockCallback
			);
			historyRouter.navigate(path, state);

			expect(pushStateSpy).toHaveBeenCalledWith(state, '', path);
			expect(window.location.pathname).toBe(path);
			expect(mockCallback).toHaveBeenCalledWith(
				expect.objectContaining({ pattern: path, state })
			);
		});

		test('it responds to popstate event (back/forward)', () => {
			const homeCallback = vi.fn();
			const aboutCallback = vi.fn();

			historyRouter.registerRoute(
				{ pattern: '/', id: 'home', exact: true, composeFunction: vi.fn() },
				homeCallback
			);
			historyRouter.registerRoute(
				{ pattern: '/about', id: 'about', composeFunction: vi.fn() },
				aboutCallback
			);

			// Simulate navigation to /about
			window.history.pushState({ page: 'about' }, '', '/about');
			// Manually trigger router's processing for this state as if navigated to
			historyRouter.processPath('/about', { page: 'about' });
			expect(aboutCallback).toHaveBeenCalledTimes(1);

			// Simulate popstate back to /
			window.history.replaceState({ page: 'home' }, '', '/'); // Change current URL
			const popStateEvent = new PopStateEvent('popstate', {
				state: { page: 'home' },
			});
			window.dispatchEvent(popStateEvent);

			expect(homeCallback).toHaveBeenCalledWith(
				expect.objectContaining({ pattern: '/', state: { page: 'home' } })
			);
		});

		test('it extracts route parameters', () => {
			const mockCallback = vi.fn();
			const pattern = '/user/{userId}/post/{postId}';
			historyRouter.registerRoute(
				{ pattern, id: 'userPost', composeFunction: vi.fn() },
				mockCallback
			);

			historyRouter.navigate('/user/123/post/abc');
			expect(mockCallback).toHaveBeenCalledWith(
				expect.objectContaining({
					pattern,
					params: { userId: '123', postId: 'abc' },
				})
			);
		});

		test('it parses query parameters', () => {
			const mockCallback = vi.fn();
			const pattern = '/search';
			historyRouter.registerRoute(
				{ pattern, id: 'search', composeFunction: vi.fn() },
				mockCallback
			);

			historyRouter.navigate('/search?q=test&filter=active');
			expect(mockCallback).toHaveBeenCalledWith(
				expect.objectContaining({
					pattern,
					search: { q: 'test', filter: 'active' },
				})
			);
		});
	});
});
