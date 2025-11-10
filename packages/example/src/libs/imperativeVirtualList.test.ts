/**
 * @vitest-environment jsdom
 */
import type { Mock } from 'vitest';

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createImperativeVirtualList } from './imperativeVirtualList.js';
import { Direction } from 'crt';

// Mock the 'crt' module to control getBaseFontSize for predictable rem calculation
vi.mock('crt', async () => {
	const actual = await vi.importActual('crt');
	return {
		...actual,
		getBaseFontSize: vi.fn(() => 10), // Mock to return a predictable 10px
	};
});

describe('imperativeVirtualList/createImperativeVirtualList', () => {
	let container: HTMLDivElement;
	let mockData: { id: number; name: string }[];
	let renderRow: Mock;

	beforeEach(() => {
		container = document.createElement('div');
		container.id = 'vlist-container';
		document.body.appendChild(container);

		mockData = Array.from({ length: 100 }, (_, i) => ({
			id: i,
			name: `Item ${i}`,
		}));
		renderRow = vi.fn((item) => {
			const el = document.createElement('div');
			el.textContent = item.name;
			return el;
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('should initialize correctly and render the first visible elements', () => {
		const vl = createImperativeVirtualList({
			data: mockData,
			container: '#vlist-container',
			renderRow,
			elHeight: 50, // 50px
			visibleEls: 10,
		});

		vl.init();

		expect(vl.containerEl).toBe(container);
		expect(vl.elHeight).toBe(5); // 50px / 10px base font size = 5rem
		expect(container.children.length).toBe(1);
		const slider = container.children[0];
		expect(slider.children.length).toBe(10);
		expect(slider.children[0].textContent).toBe('Item 0');
		expect(slider.children[9].textContent).toBe('Item 9');
		expect(renderRow).toHaveBeenCalledTimes(10);
	});

	test('updateList(DOWN): should add new elements when scrolling near the end of the window', () => {
		const vl = createImperativeVirtualList({
			data: mockData,
			container: '#vlist-container',
			renderRow,
			elHeight: 50,
			visibleEls: 10,
			bufferAmount: 3,
		});
		vl.init();

		// upper bound is 9, buffer is 3. Trigger position is 9 - 3 = 6.
		// Let's scroll to position 7.
		vl.updateList(Direction.DOWN, 7);

		const slider = vl.sliderEl;
		// Should have added the next `visibleEls` (10) items
		expect(slider.children.length).toBe(20);
		expect(slider.lastChild?.textContent).toBe('Item 19');
		expect(vl.window).toEqual([0, 19]);
	});

	test('updateList(DOWN): should virtualize by removing top rows when scrolling far down', () => {
		const vl = createImperativeVirtualList({
			data: mockData,
			container: '#vlist-container',
			renderRow,
			elHeight: 50,
			visibleEls: 10,
			bufferAmount: 5,
		});
		vl.init(); // window [0, 9], children 10

		// Scroll down to add the next set of rows
		vl.updateList(Direction.DOWN, 6); // Appends 10 items. window: [0, 19], children: 20

		// Scroll far enough to trigger virtualization
		// lowerBound = 0, visibleEls = 10, bufferAmount = 5. Trigger > 15
		vl.updateList(Direction.DOWN, 16); // Shifts window down. Removes 10, adds 10.

		const slider = vl.sliderEl;
		// The number of rendered elements should remain consistent after virtualization.
		expect(slider.children.length).toBe(20);
		// The first child should now be what was originally the 11th element (Item 10)
		expect(slider.children[0].textContent).toBe('Item 10');
		// Padding top should be set to the height of the removed elements
		// 10 elements * 5rem height = 50rem
		expect(slider.style.paddingTop).toBe('50rem');
		// Window should be updated
		expect(vl.window).toEqual([10, 29]); // upper bound is 19 + 10 = 29
	});

	test('updateList(UP): should prepend elements when scrolling near the start of the window', () => {
		const vl = createImperativeVirtualList({
			data: mockData,
			container: '#vlist-container',
			renderRow,
			elHeight: 50,
			visibleEls: 10,
			bufferAmount: 5,
		});
		vl.init();

		// First, scroll down to a point where we can scroll back up
		vl.updateList(Direction.DOWN, 16); // Shifts window. window: [10, 19], children: 10, paddingTop: 50rem
		vl.updateList(Direction.DOWN, 26); // Shifts window again. window: [20, 29], children: 10, paddingTop: 100rem

		// Now, scroll up to trigger prepending
		// lowerBound = 20, bufferAmount = 5. Trigger position <= 25
		vl.updateList(Direction.UP, 24);

		const slider = vl.sliderEl;
		// Should have prepended 10 new items, making the total 20.
		expect(slider.children.length).toBe(20);
		// The first child should now be Item 10
		expect(slider.children[0].textContent).toBe('Item 10');
		// Padding top should be reduced
		// 100rem - (10 items * 5rem height) = 50rem
		expect(slider.style.paddingTop).toBe('50rem');
		// Window should be updated
		expect(vl.window).toEqual([10, 29]); // lower bound changes, upper bound does not
	});

	test('should set the transform style on updateList', () => {
		const vl = createImperativeVirtualList({
			data: mockData,
			container: '#vlist-container',
			renderRow,
			elHeight: 50, // 5rem
		});
		vl.init();

		vl.updateList(Direction.DOWN, 3);

		expect(vl.sliderEl.style.transform).toBe('translateY(-15rem)'); // 3 * 5rem
	});
});
