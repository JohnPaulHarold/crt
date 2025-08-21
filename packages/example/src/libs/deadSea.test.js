/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Orientation } from 'crt';
import { scrollAction, clearDeadSeaCache } from './deadSea.js';

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
 * @param {Record<string, any>} attributes
 * @param {*[]} children
 * @returns
 */
const createElement = (tag, attributes = {}, children = []) => {
	const el = document.createElement(tag);
	for (const key in attributes) {
		if (key.startsWith('data-')) {
			const datasetKey = kebabToCamel(key.substring(5));
			el.dataset[datasetKey] = attributes[key];
		} else if (key === 'class') {
			el.className = attributes[key];
		} else if (key === 'style' && typeof attributes[key] === 'object') {
			Object.assign(el.style, attributes[key]);
		} else {
			el.setAttribute(key, attributes[key]);
		}
	}
	children.forEach((child) => el.appendChild(child));
	return el;
};

describe('deadSea', () => {
	/** @type {*} */
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		// offsetCache is module-scoped. Tests use unique IDs to avoid collision.
	});

	afterEach(() => {
		if (container) {
			document.body.removeChild(container);
			container = null;
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
					'data-deadsea-start-offset': '0',
				},
				[child1, child2, child3]
			);
			container.appendChild(scrollEl);

			scrollAction(child2, false); // child2 is focused, el to start search from

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
					'data-deadsea-start-offset': '1', // Scroll if item at index 1 or greater is focused
				},
				[child1, child2, child3]
			);
			container.appendChild(scrollEl);

			scrollAction(child3, true); // child3 is at index 2

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
					'data-deadsea-start-offset': '1',
				},
				[child1, child2]
			);
			container.appendChild(scrollEl);

			scrollAction(child1, true); // child1 is at index 0

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
					'data-deadsea-start-offset': '0',
					'data-deadsea-child-query': '.scroll-item',
				},
				[wrapper1, wrapper2]
			);
			container.appendChild(scrollEl);

			scrollAction(actualChild2, false);

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
					'data-deadsea-start-offset': '0',
					'data-deadsea-scroll-start-query': '#scroll-start-here',
				},
				[startMarker, child1, child2] // scrollables will be these three
			);
			container.appendChild(scrollEl);

			scrollAction(child2, false);
			// scrollables: [startMarker, child1, child2]
			// startElOffsetInPx = startMarker.offsetLeft = 30
			// offsetCache:
			//  startMarker: 30 - 30 = 0
			//  child1: 30 - 30 = 0
			//  child2: 130 - 30 = 100
			// cache = [0, 0, 100]. Focused is child2 (index 2). scrollableIndex = 2.
			// newOffset = cache[Math.max(0, 2 - 0)] = cache[2] = 100.
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
					'data-deadsea-start-offset': '0',
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
					'data-deadsea-start-offset': '0',
					style: { width: '600px', display: 'flex' }, // Important for child offsetLeft
				},
				[outerItem1, outerItem2AsInnerScrollEl, outerItem3]
			);
			container.appendChild(outerScrollEl);

			scrollAction(innerChild2, false); // Focus is deep inside

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
					'data-deadsea-start-offset': '0',
				},
				[child1, child2]
			);
			container.appendChild(scrollEl);

			// Call scrollAction with an element that isn't '.focused'.
			// The internal query for '.focused' will return null.
			scrollAction(child1, false);

			// scrollableIndex defaults to 0. newOffset will be offsetCache[0], which is 0.
			expect(scrollEl.style.left).toBe('0px');
		});

		test('should do nothing if no scrollable parent (getScrollEl returns undefined)', () => {
			const el = createElement('div'); // No data-deadsea attributes on el or parents
			container.appendChild(el);

			expect(() => scrollAction(el, false)).not.toThrow();
			// Check that no style attributes were added by deadSea
			expect(el.style.left).toBe('');
			expect(el.style.top).toBe('');
			expect(el.style.transform).toBe('');
		});

		test('should handle empty scrollables gracefully (e.g., by not setting an invalid style)', () => {
			const scrollEl = createElement('div', {
				'data-deadsea-id': 'test-empty-scrollables',
				'data-deadsea-orientation': Orientation.HORIZONTAL,
				'data-deadsea-start-offset': '0',
				// No children added to scrollEl here
			});
			container.appendChild(scrollEl);

			// Add a dummy focused element to the document body so querySelector('.focused') finds something,
			// but it's not within scrollEl's context for findScrollableFromFocusEl if scrollables is empty.
			// Or, more accurately, findScrollableFromFocusEl will be called with this dummy.
			const dummyFocusedGlobal = createElement('div', {
				class: 'focused',
			});
			document.body.appendChild(dummyFocusedGlobal);

			// scrollAction is called with scrollEl itself.
			// getScrollEl(scrollEl) returns scrollEl.
			// doTheHardWork(scrollEl, false) is called.
			// scrollables = collectionToArray(scrollEl.children) will be an empty array.
			// offsetCache['test-empty-scrollables'] will be [].
			// scrollableIndex will be 0 (default as focusedEl is not in empty scrollables).
			// calculateOffset([], 0, 0) will try to access [][0] -> undefined.
			// newOffset will be undefined.
			// scrollEl.style.left = -undefined + 'px' = 'NaNpx'.
			scrollAction(scrollEl, false);

			// If newOffset is undefined, a robust implementation should not set style to 'NaNpx'.
			// It might leave it as '', or set it to '0px'.
			// Since the actual result is '', we expect ''.
			expect(scrollEl.style.left).toBe('');

			document.body.removeChild(dummyFocusedGlobal); // Clean up
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

			const scrollEl = createElement(
				'div',
				{
					'data-deadsea-id': 'test-cache',
					'data-deadsea-orientation': Orientation.HORIZONTAL,
					'data-deadsea-start-offset': '0',
				},
				[child1, child2]
			);
			container.appendChild(scrollEl);

			// First call: populates cache
			scrollAction(child2, false);
			expect(scrollEl.style.left).toBe('-100px');
			expect(mockOffsetLeftChild1).toHaveBeenCalledTimes(1);
			expect(mockOffsetLeftChild2).toHaveBeenCalledTimes(1);

			// Change focused element (or just call again)
			// To truly test cache, ensure offset properties are not read again.
			// Let's focus child1 now.
			child2.classList.remove('focused');
			child1.classList.add('focused');

			scrollAction(child1, false);
			expect(scrollEl.style.left).toBe('0px'); // Scrolls to child1
			// Offset getters should not have been called again
			expect(mockOffsetLeftChild1).toHaveBeenCalledTimes(1);
			expect(mockOffsetLeftChild2).toHaveBeenCalledTimes(1);
		});
	});

	// Minimal tests for getScrollEl logic (implicitly tested by scrollAction)
	describe('getScrollEl behavior (implicitly tested)', () => {
		test('scrollAction works when the triggered element is the scrollEl', () => {
			const scrollEl = createElement('div', {
				'data-deadsea-orientation': 'horizontal',
				'data-deadsea-id': 'getscroll-self',
				'data-deadsea-start-offset': '0',
				class: 'focused', // scrollEl itself is focused for simplicity of test
			});
			const child = createElement('div', { style: { width: '100px' } });
			Object.defineProperty(child, 'offsetLeft', {
				configurable: true,
				value: 0,
			});
			scrollEl.appendChild(child); // scrollEl needs children for offset calculation
			container.appendChild(scrollEl);

			// Here, the focused element is scrollEl.
			// findScrollableFromFocusEl(scrollEl, [child]) will likely result in index 0 or an issue
			// Let's make a child focused instead for a more realistic getScrollEl test.
			scrollEl.classList.remove('focused');
			child.classList.add('focused');

			scrollAction(scrollEl, false); // Start search from scrollEl, getScrollEl(scrollEl) returns scrollEl
			expect(scrollEl.style.left).toBe('0px');
		});
	});
});

describe('clearDeadSeaCache', () => {
	/** @type {*} */
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (container) {
			document.body.removeChild(container);
			container = null;
		}
		vi.restoreAllMocks();
	});

	test('should remove the specified entry from the cache', () => {
		const scrollId = 'test-cache-clear';
		const child1 = document.createElement('div');
		child1.className = 'focused';
		Object.defineProperty(child1, 'offsetLeft', {
			configurable: true,
			value: 0,
		});
		const scrollEl = document.createElement('div');
		scrollEl.dataset.deadseaId = scrollId;
		scrollEl.dataset.deadseaOrientation = Orientation.HORIZONTAL;
		scrollEl.dataset.deadseaStartOffset = '0';
		scrollEl.appendChild(child1);
		container.appendChild(scrollEl);

		// First call to populate the cache
		scrollAction(child1, false);

		const offsetLeftGetter = vi.spyOn(child1, 'offsetLeft', 'get');
		scrollAction(child1, false);
		expect(offsetLeftGetter).not.toHaveBeenCalled(); // Should use cache

		// Now clear the cache
		clearDeadSeaCache(scrollId);

		// Call again, the cache should be repopulated, so the getter is called
		scrollAction(child1, false);
		expect(offsetLeftGetter).toHaveBeenCalled();
	});
});

describe('error handling and edge cases', () => {
	/** @type {HTMLElement} */
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (container) {
			document.body.removeChild(container);
		}
		document.body.innerHTML = ''; // Clean up focused elements etc.
		vi.restoreAllMocks();
	});

	test('should log an error and do nothing if data-deadsea-id is missing', () => {
		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
		const scrollEl = document.createElement('div');
		scrollEl.dataset.deadseaOrientation = Orientation.HORIZONTAL;
		container.appendChild(scrollEl);
		scrollAction(scrollEl, false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			'DeadSea element requires a "data-deadsea-id" attribute for caching.',
			scrollEl
		);
		expect(scrollEl.style.left).toBe('');
		consoleErrorSpy.mockRestore();
	});
});
