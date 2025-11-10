/**
 * @vitest-environment jsdom
 */
import type { Mock } from 'vitest';

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Carousel } from './Carousel.js';
import { div } from '../html.js';
import { navigationService } from '../services/navigationService.js';
import { deadSeaService } from '../libs/deadSea.js';

// Mock the services that the Carousel component interacts with.
vi.mock('../services/navigationService.js', () => ({
	navigationService: {
		moveFocus: vi.fn(),
	},
}));

vi.mock('../libs/deadSea.js', () => ({
	deadSeaService: {
		page: vi.fn(),
	},
}));

describe('Carousel', () => {
	beforeEach(() => {
		// Clear mock history before each test
		vi.clearAllMocks();
	});

	test('construction', () => {
		const assert = Carousel({ id: 'xyz', orientation: 'vertical' }, [
			div({}, 'X'),
			div({}, 'Y'),
			div({}, 'Z'),
		]);

		expect(assert).toBeInstanceOf(HTMLElement);
	});

	test('construction with no title', () => {
		const c = 'xyz';
		const assert = Carousel(
			{
				id: 'xyz',
				orientation: 'horizontal',
				className: c,
			},
			[div({}, 'X'), div({}, 'Y'), div({}, 'Z')]
		);
		const heading = assert.querySelector('h2');
		expect(assert.className).toContain(c);
		expect(heading).toBeFalsy();
	});

	test('construction with title', () => {
		const title = 'EX WHY ZED';
		const assert = Carousel(
			{
				id: 'xyz',
				orientation: 'horizontal',
				heading: title,
			},
			[div({}, 'X'), div({}, 'Y'), div({}, 'Z')]
		);
		const heading = assert.querySelector('h2');
		expect(heading).toBeTruthy();
		expect(heading?.textContent).toEqual(title);
	});

	test('applies itemMargin and handles arrow clicks when showArrows is true', () => {
		const itemMargin = 24;
		const children = [
			div({ id: 'child-1' }, 'X'),
			div({ id: 'child-2' }, 'Y'),
			div({ id: 'child-3' }, 'Z'),
		];
		const carouselEl = Carousel(
			{
				id: 'arrow-carousel',
				orientation: 'horizontal',
				itemMargin: itemMargin,
				showArrows: true,
			},
			children
		);

		document.body.appendChild(carouselEl);

		// 1. Verify itemMargin is applied correctly
		const child1 = (
			carouselEl.querySelector<HTMLElement>('#child-1')
		);
		const child2 = (
			carouselEl.querySelector<HTMLElement>('#child-2')
		);
		const child3 = (
			carouselEl.querySelector<HTMLElement>('#child-3')
		); // This is the last child

		if (!child1 || !child2 || !child3) throw new Error('Child elements not found');


		expect(child1.style.marginRight).toBe(`${itemMargin}px`);
		expect(child2.style.marginRight).toBe(`${itemMargin}px`);
		expect(child3.style.marginRight).toBe(''); // The last child should not have a margin

		// 2. Verify arrows are rendered
		const prevArrow = (
			carouselEl.querySelector<HTMLButtonElement>('.prev')
		);
		const nextArrow = (
			carouselEl.querySelector<HTMLButtonElement>('.next')
		);
		expect(prevArrow).toBeInstanceOf(HTMLButtonElement);
		expect(nextArrow).toBeInstanceOf(HTMLButtonElement);

		if (!prevArrow || !nextArrow) throw new Error('Arrow elements not found')

		// 3. Simulate arrow clicks and verify service calls
		const fakeNextElement = div({});
		(deadSeaService.page as Mock).mockReturnValue(
			fakeNextElement
		);

		// Simulate clicking the "next" arrow
		nextArrow.click();
		expect(deadSeaService.page).toHaveBeenCalledWith(
			'arrow-carousel',
			'forward'
		);
		expect(navigationService.moveFocus).toHaveBeenCalledWith(fakeNextElement);

		// Simulate clicking the "previous" arrow
		prevArrow.click();
		expect(deadSeaService.page).toHaveBeenCalledWith(
			'arrow-carousel',
			'backward'
		);
		expect(navigationService.moveFocus).toHaveBeenCalledWith(fakeNextElement);

		// Cleanup
		document.body.removeChild(carouselEl);
	});
});
