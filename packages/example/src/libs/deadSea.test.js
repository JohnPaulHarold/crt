/**
 * @vitest-environment jsdom
 */
import {
	describe,
	test,
	expect,
	beforeEach,
	afterEach,
	vi,
	beforeAll,
	afterAll,
} from 'vitest';
import { Orientation, loga } from 'crt';
import { deadSeaService } from './deadSea.js';

// Helper to convert kebab-case to camelCase
/**
 *
 * @param {string} s
 * @returns {string}
 */
const kebabToCamel = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());

// Helper to create elements and set data attributes
/**
 *
 * @param {string} tag
 * @param {Record<string, unknown>} attributes
 * @param {*[]} children
 * @returns {HTMLElement}
 */
const createElement = (tag, attributes = {}, children = []) => {
	const el = document.createElement(tag);
	for (const key in attributes) {
		if (key.startsWith('data-')) {
			const datasetKey = kebabToCamel(key.substring(5));
			el.dataset[datasetKey] = String(attributes[key]);
		} else if (key === 'class') {
			el.className = String(attributes[key]);
		} else if (key === 'style' && typeof attributes[key] === 'object') {
			Object.assign(el.style, attributes[key]);
		} else {
			el.setAttribute(key, String(attributes[key]));
		}
	}
	children.forEach((child) => el.appendChild(child));
	return el;
};

/**
 * Local definition of LogLevel enum to control logging verbosity in tests.
 * This avoids needing to export it from the core `crt` package if it's not already.
 * @readonly
 * @enum {number}
 */
const LogLevel = {
	NONE: 0,
	ERROR: 1,
	WARN: 2,
	INFO: 4,
	LOG: 5,
};

describe('deadSeaService', () => {
	/** @type { number | undefined } */
	let originalLogLevel;

	beforeAll(() => {
		originalLogLevel = loga.getLogLevel();
		// Suppress informational logs during tests to keep the output clean, but allow warnings and errors.
		loga.setLogLevel(LogLevel.WARN);
	});

	afterAll(() => {
		// Restore the original log level after all tests in this suite have run.
		if (originalLogLevel !== undefined) {
			loga.setLogLevel(originalLogLevel);
		}
	});

	/** @type {*} */
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		// Reset the service's internal state for test isolation
		deadSeaService.unregisterAll();
	});

	afterEach(() => {
		if (container) {
			document.body.removeChild(container);
		}

		document.body.innerHTML = ''; // Clean up focused elements etc.
		vi.restoreAllMocks();
	});

	describe('scrollAction', () => {
		test('should scroll horizontally using style.left when useTransforms is false', () => {
			const child1 = createElement('div', {
				style: { width: '100px', height: '50px' },
			});
			const child2 = createElement('div', {
				class: 'focused',
				style: { width: '100px', height: '50px' },
			});
			const child3 = createElement('div', {
				style: { width: '100px', height: '50px' },
			});

			Object.defineProperty(child1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(child2, 'offsetLeft', {
				configurable: true,
				value: 100,
			});
			Object.defineProperty(child3, 'offsetLeft', {
				configurable: true,
				value: 200,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-h-style',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
				},
				[child1, child2, child3]
			);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child2, false); // child2 is focused, el to start search from

			expect(scrollEl.style.left).toBe('-100px');
		});

		test('should scroll vertically using transform when useTransforms is true and start-offset is met', () => {
			const child1 = createElement('div', { style: { height: '50px' } });
			const child2 = createElement('div', { style: { height: '50px' } }); // Not focused, but part of offset calculation
			const child3 = createElement('div', {
				class: 'focused',
				style: { height: '50px' },
			});

			Object.defineProperty(child1, 'offsetTop', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(child2, 'offsetTop', {
				configurable: true,
				value: 50,
			});
			Object.defineProperty(child3, 'offsetTop', {
				configurable: true,
				value: 100,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-v-transform',
					'data-deadsea-orientation': Orientation.VERTICAL,
					'data-deadsea-start-padding-items': '1', // Scroll if item at index 1 or greater is focused
				},
				[child1, child2, child3]
			);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child3, true); // child3 is at index 2

			expect(scrollEl.style.transform).toBe('translateY(-50px)');
		});

		test('should not scroll if focused item index is less than start-offset', () => {
			const child1 = createElement('div', {
				class: 'focused',
				style: { height: '50px' },
			});
			const child2 = createElement('div', { style: { height: '50px' } });

			Object.defineProperty(child1, 'offsetTop', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(child2, 'offsetTop', {
				configurable: true,
				value: 50,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-no-scroll-offset',
					'data-deadsea-orientation': Orientation.VERTICAL,
					'data-deadsea-start-padding-items': '1',
				},
				[child1, child2]
			);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child1, true); // child1 is at index 0

			// It should reset the scroll position
			expect(scrollEl.style.transform).toBe('');
			expect(scrollEl.style.top).toBe('0px');
		});

		test('should use data-deadsea-child-query to find scrollable items', () => {
			const actualChild1 = createElement('div', {
				class: 'scroll-item',
				style: { width: '100px' },
			});
			const wrapper1 = createElement('div', {}, [actualChild1]);
			const actualChild2 = createElement('div', {
				class: 'scroll-item focused',
				style: { width: '100px' },
			});
			const wrapper2 = createElement('div', {}, [actualChild2]);

			Object.defineProperty(actualChild1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(actualChild2, 'offsetLeft', {
				configurable: true,
				value: 100,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-child-query',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
					'data-deadsea-child-query': '.scroll-item',
				},
				[wrapper1, wrapper2]
			);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(actualChild2, false);

			expect(scrollEl.style.left).toBe('-100px');
		});

		test('should adjust scroll based on data-deadsea-scroll-start-query', () => {
			const startMarker = createElement('div', {
				id: 'scroll-start-here',
				style: { width: '30px' },
			}); // This defines the 0px scroll point
			const child1 = createElement('div', { style: { width: '100px' } }); // Effective offset 0 from startMarker
			const child2 = createElement('div', {
				class: 'focused',
				style: { width: '100px' },
			}); // Effective offset 100 from startMarker

			Object.defineProperty(startMarker, 'offsetLeft', {
				configurable: true,
				value: 30,
			});
			Object.defineProperty(child1, 'offsetLeft', {
				configurable: true,
				value: 30,
			});
			Object.defineProperty(child2, 'offsetLeft', {
				configurable: true,
				value: 130,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-scroll-start-query',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
					'data-deadsea-scroll-start-query': '#scroll-start-here',
				},
				[startMarker, child1, child2] // scrollables will be these three
			);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child2, false);

			expect(scrollEl.style.left).toBe('-100px');
		});

		test('should handle nested scrollable elements', () => {
			const innerChild1 = createElement('div', {
				style: { width: '50px' },
			});
			const innerChild2 = createElement('div', {
				class: 'focused',
				style: { width: '50px' },
			});
			Object.defineProperty(innerChild1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(innerChild2, 'offsetLeft', {
				configurable: true,
				value: 50,
			});

			const innerScrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'inner-nested',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
					style: { width: '200px', display: 'flex' }, // Important for child offsetLeft
				},
				[innerChild1, innerChild2]
			);

			const outerItem1 = createElement('div', {
				style: { width: '200px' },
			});
			const outerItem2AsInnerScrollEl = innerScrollEl; // innerScrollEl is a child of outerScrollEl
			const outerItem3 = createElement('div', {
				style: { width: '200px' },
			});

			Object.defineProperty(outerItem1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(outerItem2AsInnerScrollEl, 'offsetLeft', {
				configurable: true,
				value: 200,
			});
			Object.defineProperty(outerItem3, 'offsetLeft', {
				configurable: true,
				value: 400,
			});

			const outerScrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'outer-nested',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
					style: { width: '600px', display: 'flex' }, // Important for child offsetLeft
				},
				[outerItem1, outerItem2AsInnerScrollEl, outerItem3]
			);
			container.appendChild(outerScrollEl);

			deadSeaService.register(innerScrollEl);
			deadSeaService.register(outerScrollEl);
			deadSeaService.scrollAction(innerChild2, false); // Focus is deep inside

			expect(innerScrollEl.style.left).toBe('-50px');
			// outerItem2AsInnerScrollEl is at index 1 in outerScrollEl's children
			// Its offsetLeft is 200.
			expect(outerScrollEl.style.left).toBe('-200px');
		});

		test('should default to index 0 for scroll calculation if no focused element is found', () => {
			const child1 = createElement('div', { style: { width: '100px' } });
			const child2 = createElement('div', { style: { width: '100px' } }); // No .focused class on any child

			Object.defineProperty(child1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(child2, 'offsetLeft', {
				configurable: true,
				value: 100,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-no-actual-focus',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
				},
				[child1, child2]
			);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child1, false);

			expect(scrollEl.style.left).toBe('0px');
		});

		test('should do nothing if no scrollable parent (getScrollEl returns undefined)', () => {
			const el = createElement('div'); // No data-deadsea attributes on el or parents
			container.appendChild(el);

			expect(() => deadSeaService.scrollAction(el, false)).not.toThrow();
			// Check that no style attributes were added by deadSea
			expect(el.style.left).toBe('');
			expect(el.style.top).toBe('');
			expect(el.style.transform).toBe('');
		});

		test('should handle empty scrollables gracefully (e.g., by not setting an invalid style)', () => {
			const scrollEl = createElement('div', {
				'data-deadsea-id': 'test-empty-scrollables',
				'data-deadsea-orientation': Orientation.HORIZONTAL,
				'data-deadsea-start-padding-items': '0',
				// No children added to scrollEl here
			});
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(scrollEl, false);

			expect(scrollEl.style.left).toBe('');
		});

		test('should use cached offsets on subsequent calls for the same scrollId', () => {
			const child1 = createElement('div', { style: { width: '100px' } });
			const child2 = createElement('div', {
				class: 'focused',
				style: { width: '100px' },
			});

			const mockOffsetLeftChild1 = vi.fn(() => 0);
			const mockOffsetLeftChild2 = vi.fn(() => 100);
			Object.defineProperty(child1, 'offsetLeft', {
				configurable: true,
				get: mockOffsetLeftChild1,
			});
			Object.defineProperty(child2, 'offsetLeft', {
				configurable: true,
				get: mockOffsetLeftChild2,
			});
			Object.defineProperty(child2, 'offsetWidth', {
				configurable: true,
				value: 100,
			});

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-cache',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-padding-items': '0',
				},
				[child1, child2]
			);
			container.appendChild(scrollEl);

			// First call: populates cache
			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child2, false);
			expect(scrollEl.style.left).toBe('-100px');
			expect(mockOffsetLeftChild1).toHaveBeenCalledTimes(1);
			expect(mockOffsetLeftChild2).toHaveBeenCalledTimes(1);

			child2.classList.remove('focused');
			child1.classList.add('focused');

			deadSeaService.scrollAction(child1, false);
			expect(scrollEl.style.left).toBe('0px'); // Scrolls to child1
			// Offset getters should not have been called again
			expect(mockOffsetLeftChild1).toHaveBeenCalledTimes(1);
			expect(mockOffsetLeftChild2).toHaveBeenCalledTimes(1);
		});

		test('should warn and do nothing if scrollAction is called on an unregistered element', () => {
			const consoleWarnSpy = vi
				.spyOn(console, 'warn')
				.mockImplementation(() => {});
			const scrollEl = createElement('div', {
				'data-deadsea-id': 'unregistered',
				'data-deadsea-orientation': Orientation.HORIZONTAL,
			});
			const child = createElement('div', { class: 'focused' });
			scrollEl.appendChild(child);
			container.appendChild(scrollEl);

			deadSeaService.scrollAction(child, false);

			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('[WARN][deadsea]'),
				expect.any(String),
				'[deadSea] Geometry for scrollId "unregistered" not found in cache. Was it registered?'
			);
			expect(scrollEl.style.left).toBe('');
			consoleWarnSpy.mockRestore();
		});

		test('should not scroll if content is smaller than or equal to the container', () => {
			const scrollEl = createElement('div', {
				'data-deadsea-id': 'test-no-scroll-needed',
				'data-deadsea-orientation': Orientation.HORIZONTAL,
				style: { width: '300px' },
			});
			// Mock the element's live size property
			Object.defineProperty(scrollEl, 'offsetWidth', {
				configurable: true,
				value: 300,
			});

			const child1 = createElement('div', { style: { width: '100px' } });
			const child2 = createElement('div', {
				class: 'focused',
				style: { width: '200px' },
			});
			Object.defineProperty(child1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			Object.defineProperty(child2, 'offsetLeft', {
				configurable: true,
				value: 100,
			});
			Object.defineProperty(child2, 'offsetWidth', {
				configurable: true,
				value: 200,
			}); // Total content width is 100 + 200 = 300

			scrollEl.append(child1, child2);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(child2, false);

			expect(scrollEl.style.left).toBe('0px');
		});

		test('should not scroll past the last item', () => {
			// Container is 300px wide. Content is 350px wide.
			const scrollEl = createElement('div', {
				'data-deadsea-id': 'test-no-overscroll',
				'data-deadsea-orientation': Orientation.HORIZONTAL,
				style: { width: '300px' },
			});
			Object.defineProperty(scrollEl, 'offsetWidth', { value: 300 });

			const children = [
				createElement('div', { style: { width: '100px' } }), // 0
				createElement('div', { style: { width: '100px' } }), // 100
				createElement('div', { class: 'focused', style: { width: '150px' } }), // 200, total width 350
			];
			Object.defineProperty(children[0], 'offsetLeft', { value: 0 });
			Object.defineProperty(children[1], 'offsetLeft', { value: 100 });
			Object.defineProperty(children[2], 'offsetLeft', { value: 200 });
			Object.defineProperty(children[2], 'offsetWidth', { value: 150 });
			scrollEl.append(...children);
			container.appendChild(scrollEl);
			deadSeaService.register(scrollEl);
			deadSeaService.scrollAction(children[2], false);
			// maxScrollOffset = 350 - 300 = 50. Should scroll to -50px.
			expect(scrollEl.style.left).toBe('-50px');
		});
	});

	describe('page', () => {
		test('should return the first off-screen element when paging forward (horizontal)', () => {
			const child1 = createElement('div');
			const child2 = createElement('div');
			const child3 = createElement('div'); // This one should be returned
			const scrollEl = createElement(
				'div',
				{ 'data-deadsea-id': 'page-h-fwd' },
				[child1, child2, child3]
			);
			container.appendChild(scrollEl);

			// Mock geometry
			vi.spyOn(scrollEl, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 200,
				width: 200,
				height: 0,
				x: 0,
				y: 0,
				bottom: 0,
				top: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});
			vi.spyOn(child1, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				right: 100,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				bottom: 0,
				top: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});
			vi.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
				left: 100,
				right: 200,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				bottom: 0,
				top: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});
			vi.spyOn(child3, 'getBoundingClientRect').mockReturnValue({
				left: 200,
				right: 300,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				bottom: 0,
				top: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});

			deadSeaService.register(scrollEl);
			const nextEl = deadSeaService.page('page-h-fwd', 'forward');

			expect(nextEl).toBe(child3);
		});

		test('should return the correct element when paging backward (vertical)', () => {
			const child1 = createElement('div'); // This one should be returned
			const child2 = createElement('div');
			const child3 = createElement('div');
			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'page-v-bwd',
					'data-deadsea-orientation': Orientation.VERTICAL,
				},
				[child1, child2, child3]
			);
			container.appendChild(scrollEl);

			// Mock geometry: child1 is off-screen top, child2/3 are visible
			vi.spyOn(scrollEl, 'getBoundingClientRect').mockReturnValue({
				top: 0,
				bottom: 200,
				height: 200,
				width: 0,
				x: 0,
				y: 0,
				left: 0,
				right: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});
			vi.spyOn(child1, 'getBoundingClientRect').mockReturnValue({
				top: -100,
				bottom: 0,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				left: 0,
				right: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});
			vi.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
				top: 0,
				bottom: 100,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				left: 0,
				right: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});
			vi.spyOn(child3, 'getBoundingClientRect').mockReturnValue({
				top: 100,
				bottom: 200,
				height: 0,
				width: 0,
				x: 0,
				y: 0,
				left: 0,
				right: 0,
				toJSON: function () {
					throw new Error('Function not implemented.');
				},
			});

			deadSeaService.register(scrollEl);
			const prevEl = deadSeaService.page('page-v-bwd', 'backward');

			expect(prevEl).toBe(child1);
		});
	});

	describe('unregister', () => {
		test('unregister should remove the specified entry from the cache', () => {
			const scrollId = 'test-cache-clear';
			const child1 = createElement('div', { class: 'focused' });
			Object.defineProperty(child1, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			const scrollEl = createElement('div', {
				'data-deadsea-id': scrollId,
				'data-deadsea-orientation': Orientation.HORIZONTAL,
				'data-deadsea-start-padding-items': '0',
			});
			scrollEl.appendChild(child1);
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);

			// To prove it's cached, we spy on the offsetLeft getter.
			// It should NOT be called on the second scrollAction.
			const offsetLeftGetter = vi.spyOn(child1, 'offsetLeft', 'get');
			deadSeaService.scrollAction(child1, false);
			expect(offsetLeftGetter).not.toHaveBeenCalled();

			// Now unregister the cache
			deadSeaService.unregister(scrollId);

			// Call again. Since the cache is gone, it will try to re-register
			// (and fail, logging a warning, because we're calling scrollAction directly).
			// A better test is to register again and see if the getter is called.
			deadSeaService.register(scrollEl);
			expect(offsetLeftGetter).toHaveBeenCalled();
		});

		test('unregisterAll should clear all caches', () => {
			const scrollId1 = 'test-cache-clear-1';
			const scrollId2 = 'test-cache-clear-2';
			const child1 = createElement('div', { class: 'focused' });
			const child2 = createElement('div', { class: 'focused' });

			const scrollEl1 = createElement('div', { 'data-deadsea-id': scrollId1 });
			scrollEl1.appendChild(child1);
			const scrollEl2 = createElement('div', { 'data-deadsea-id': scrollId2 });
			scrollEl2.appendChild(child2);

			container.append(scrollEl1, scrollEl2);

			deadSeaService.register(scrollEl1);
			deadSeaService.register(scrollEl2);

			// To prove they are cached, we'll spy on the warning when we try to page.
			const consoleWarnSpy = vi
				.spyOn(console, 'warn')
				.mockImplementation(() => {});

			deadSeaService.unregisterAll();

			deadSeaService.page(scrollId1, 'forward');
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('[WARN][deadsea]'),
				expect.any(String),
				`[deadSea] Geometry for scrollId "${scrollId1}" not found in cache. Was it registered?`
			);

			deadSeaService.page(scrollId2, 'forward');
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('[WARN][deadsea]'),
				expect.any(String),
				`[deadSea] Geometry for scrollId "${scrollId2}" not found in cache. Was it registered?`
			);

			consoleWarnSpy.mockRestore();
		});

		test('should log an error if trying to register an element without a data-deadsea-id', () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const scrollEl = createElement('div', {
				'data-deadsea-orientation': Orientation.HORIZONTAL,
			});
			container.appendChild(scrollEl);

			deadSeaService.register(scrollEl);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('[ERROR][deadsea]'),
				expect.any(String),
				'[deadSea.register] Cannot register an element without a "data-deadsea-id".',
				scrollEl
			);
			consoleErrorSpy.mockRestore();
		});
	});
});
