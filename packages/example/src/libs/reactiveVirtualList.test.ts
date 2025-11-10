/**
 * @vitest-environment jsdom
 */
import type { Mock } from 'vitest';
import type { SignallerInstance } from 'crt';

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createReactiveVirtualList } from './reactiveVirtualList.js';
import { createSignaller } from 'crt';

// Mock the h function to just create simple divs with attributes for easier inspection
vi.mock('../h.js', () => ({
	h: (
		tag: string,
		options?: { props?: Record<string, unknown>; children?: unknown[] }
	) => {
		const el = document.createElement(tag);
		const props = options?.props;
		const children = options?.children;
		if (props) {
			Object.keys(props).forEach((key) => {
				if (key === 'style' && typeof props[key] === 'object') {
					Object.assign(el.style, props[key] as CSSStyleDeclaration);
				} else if (key === 'dataset' && typeof props[key] === 'object') {
					Object.assign(el.dataset, props[key] as DOMStringMap);
				} else {
					el.setAttribute(key, String(props[key]));
				}
			});
		}
		if (children) {
			children.forEach((child: unknown) => {
				if (typeof child === 'string') {
					el.appendChild(document.createTextNode(child));
				} else if (child instanceof Node) {
					el.appendChild(child);
				}
			});
		}
		return el;
	},
}));

describe('reactiveVirtualList/createReactiveVirtualList', () => {
	let mockData: { id: number; name: string }[];
	let dataSignaller: SignallerInstance<{ id: number; name: string }[]>;
	let renderRow: Mock;

	// Mock window.innerHeight to ensure scale() calculations are predictable.
	// We'll set it to 1080 so that scale(x) returns x, making assertions simpler.
	beforeEach(() => {
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	beforeEach(() => {
		mockData = Array.from({ length: 100 }, (_, i) => ({
			id: i,
			name: `Item ${i}`,
		}));
		dataSignaller = createSignaller(mockData);
		renderRow = vi.fn((item) => {
			const el = document.createElement('div');
			el.textContent = item.name;
			return el;
		});
	});

	test('should initialize and render the initial window', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500, // 10 items visible
			bufferItemCount: 2,
		});

		const slider = vl.render();
		// visible (10) + buffer (2*2) = 14 items
		expect(slider.children.length).toBe(14);
		expect((slider.children[0] as HTMLElement).style.top).toBe('0px');
		expect(renderRow).toHaveBeenCalledWith(mockData[0], 0, true);
		expect(renderRow).toHaveBeenCalledWith(mockData[13], 13, true);
	});

	test('should update translateY when focused index changes (scrollAlign: center)', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500,
			scrollAlign: 'center',
		});

		vl.setFocusedIndex(10);
		const slider = vl.render();

		// scrollOffset = 10 * 50 = 500
		// centeringOffset = 500 / 2 - 50 / 2 = 250 - 25 = 225
		// translateY = 500 - 225 = 275
		expect(slider.style.transform).toBe('translateY(-275px)');
	});

	test('should update translateY when focused index changes (scrollAlign: start)', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500,
			scrollAlign: 'start',
		});

		vl.setFocusedIndex(10);
		const slider = vl.render();

		// scrollOffset = 10 * 50 = 500
		// centeringOffset = 0
		// translateY = 500
		expect(slider.style.transform).toBe('translateY(-500px)');
	});

	test('should update the rendered window when focused index changes', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500, // 10 visible
			bufferItemCount: 5, // window size = 10 + 5*2 = 20
		});

		// Move focus far enough to shift the window
		vl.setFocusedIndex(20);
		const slider = vl.render();

		// The window should have shifted.
		// focusedIndex = 20, buffer = 5, windowSize = 20
		// startIndex = max(0, 20 - floor(20/2)) = 10
		const firstItem = slider.children[0];
		expect((firstItem as HTMLElement).style.top).toBe(`${10 * 50}px`); // 500px
		expect(renderRow).toHaveBeenCalledWith(mockData[10], 10, true);
		expect(renderRow).not.toHaveBeenCalledWith(mockData[9], 9, true);
	});

	test('should respect the gap property in calculations', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500,
			gap: 10,
			scrollAlign: 'start',
		});

		vl.setFocusedIndex(10);
		const slider = vl.render();

		// totalItemHeight = 50 + 10 = 60
		// scrollOffset = 10 * 60 = 600
		// translateY = 600
		expect(slider.style.transform).toBe('translateY(-600px)');

		// Check item position
		const firstRenderedItem = slider.children[0];
		// focusedIndex = 10, buffer = 5, windowSize = ceil(500/50) + 10 = 20
		// startIndex = max(0, 10 - 10) = 0
		expect((firstRenderedItem as HTMLElement).style.top).toBe(`${0 * 60}px`); // 0px
	});

	test('should use custom tags and apply animation style', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500,
			animate: true,
			containerTag: 'ul',
			itemWrapperTag: 'li',
		});

		const slider = vl.render();
		expect(slider.tagName).toBe('UL');
		expect(slider.style.transition).toBe('transform 0.2s ease-out');
		expect(slider.children[0].tagName).toBe('LI');
	});

	test('should not scroll past the end of the list', () => {
		const vl = createReactiveVirtualList({
			dataSignaller,
			renderRow,
			itemHeight: 50,
			containerHeight: 500, // 10 items visible
			scrollAlign: 'start',
		});

		// Focus on the last item
		vl.setFocusedIndex(99);
		const slider = vl.render();

		// totalHeight = 100 * 50 = 5000
		// maxScroll = 5000 - 500 = 4500
		expect(slider.style.transform).toBe('translateY(-4500px)');
	});
});
