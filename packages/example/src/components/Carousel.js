import { div, h2, section } from '../html.js';
import { Orientation, getPlatform } from 'crt';
import { Button } from './Button.js';
import { navigationService } from '../services/navigationService.js';
import { deadSeaService } from '../libs/deadSea.js';
import s from './Carousel.scss';

/**
 * @typedef {import('crt').ComponentProps & {
 *  heading?: string,
 *  childQuery?: string,
 *  orientation?: Orientation,
 *  blockExit?: string,
 *  wrap?: boolean,
 *  showArrows?: boolean,
 *  itemMargin?: number,
 *  backStop?: string
 *  width?: number;
 *  height?: number;
 *  scrollStartQuery?: string;
 * }} CarouselProps
 */

/**
 * A scrollable container for a list of items that can be navigated
 * spatially. Integrates with `deadSea.js` for smooth scrolling.
 *
 * @param {CarouselProps} props
 * @param {Element[]} children
 * @returns {HTMLElement}
 */
export function Carousel(props, children) {
	const {
		heading,
		showArrows,
		orientation,
		blockExit,
		wrap,
		itemMargin,
		childQuery,
		backStop,
		...rest
	} = props;

	// TODO: should be using px-to-rem...
	const width = props.width ? props.width + 'px' : '100%';
	const height = props.height ? props.height + 'px' : 'auto';

	const platform = getPlatform();

	// Apply margin directly to children to ensure it's part of the layout
	// that deadSea.js can measure correctly.
	if (itemMargin) {
		for (var i = 0; i < children.length; i++) {
			let child = children[i];
			// The `instanceof HTMLElement` check is only valid in the browser.
			// On the server, our "elements" are just objects, so we check for truthiness.
			const isElement = platform.isBrowser
				? child instanceof HTMLElement
				: !!child;

			if (isElement && i < children.length - 1) {
				var isHorizontal = orientation !== Orientation.VERTICAL;
				/** @type {HTMLElement} */ (child).style.marginRight = isHorizontal
					? itemMargin + 'px'
					: '0';
				/** @type {HTMLElement} */ (child).style.marginBottom = isHorizontal
					? '0'
					: itemMargin + 'px';
			}
		}
	}

	// The scrollable items are always in their own div for layout purposes.
	// This is the element that deadSea will find and transform.
	const scrollArea = /** @type {HTMLElement} */ (
		div(
			{
				className: s.carousel,
				dataset: {
					deadseaId: props.id || 'carousel' + Date.now(),
					deadseaOrientation: orientation || Orientation.HORIZONTAL,
					deadseaChildQuery: childQuery || '[id]', // Target direct children with an ID
					deadseaStartOffset: '0',
				},
			},
			children
		)
	);

	const handleNextClick = () => {
		const id = props.id || scrollArea.dataset.deadseaId;
		if (id) {
			const nextEl = deadSeaService.page(id, 'forward');
			if (nextEl) {
				navigationService.moveFocus(nextEl);
			}
		}
	};

	const handlePrevClick = () => {
		const id = props.id || scrollArea.dataset.deadseaId;
		if (id) {
			const prevEl = deadSeaService.page(id, 'backward');
			if (prevEl) navigationService.moveFocus(prevEl);
		}
	};

	const wrapperChildren = [scrollArea];

	if (showArrows) {
		const isVertical = orientation === Orientation.VERTICAL;
		const prevButton = Button(
			{
				className: `prev ${s.arrow} ${s.prev} lrud-ignore`,
				onclick: handlePrevClick,
			},
			isVertical ? '↑' : '←'
		);

		const nextButton = Button(
			{
				className: `next ${s.arrow} ${s.next} lrud-ignore`,
				onclick: handleNextClick,
			},
			isVertical ? '↓' : '→'
		);
		wrapperChildren.push(prevButton);
		wrapperChildren.push(nextButton);
	}

	// This div acts as the positioning context for the arrows.
	// It wraps the scrollArea and the arrows themselves.
	const scrollAndArrowWrapper = div(
		{
			className: s.scrollAndArrowWrapper,
		},
		wrapperChildren
	);

	const orientationClass =
		orientation === Orientation.VERTICAL ? s.vertical : s.horizontal;

	const content = [];

	if (heading) {
		content.push(h2({ className: s.heading }, heading));
	}
	content.push(scrollAndArrowWrapper);

	return /** @type {HTMLElement} */ (
		section(
			{
				...rest,
				// The section is the LRUD container and the positioning context for the arrows.
				className: `lrud-container ${s.carouselWrapper} ${orientationClass} ${props.className || ''}`,
				style: { width: width, height: height },
				dataset: {
					// LRUD-specific attributes live on the container.
					...props.dataset,
					blockExit: blockExit || '',
					wrap: wrap ? 'true' : 'false',
					backStop: backStop,
				},
			},
			content
		)
	);
}
