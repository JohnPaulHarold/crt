import type { OrientationType, ComponentProps } from 'crt';

import { div, h2, section } from '../html.js';
import { Orientation, getPlatform } from 'crt';
import { Button } from './Button.js';
import { navigationService } from '../services/navigationService.js';
import { deadSeaService } from '../libs/deadSea.js';

import s from './Carousel.scss';

export type CarouselProps = ComponentProps & {
	heading?: string;
	childQuery?: string;
	orientation?: OrientationType;
	blockExit?: string;
	wrap?: boolean;
	showArrows?: boolean;
	itemMargin?: number;
	backStop?: string;
	width?: number;
	height?: number;
	scrollStartQuery?: string;
};

/**
 * A scrollable container for a list of items that can be navigated
 * spatially. Integrates with `deadSea.js` for smooth scrolling.
 *
 * @param options
 */
interface CarouselOptions {
	props: CarouselProps;
	children: Element[];
}

export function Carousel(options: CarouselOptions): HTMLElement {
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
	} = options.props;

	// TODO: should be using px-to-rem... (This comment is from the original code)
	const width = options.props.width ? options.props.width + 'px' : '100%';
	const height = options.props.height ? options.props.height + 'px' : 'auto';

	const platform = getPlatform();

	// Apply margin directly to children to ensure it's part of the layout
	// that deadSea.js can measure correctly.
	if (itemMargin) {
		for (let i = 0; i < (options.children || []).length; i++) {
			const child = (options.children || [])[i];
			// The `instanceof HTMLElement` check is only valid in the browser.
			// On the server, our "elements" are just objects, so we check for truthiness.
			const isElement = platform.isBrowser
				? child instanceof HTMLElement
				: !!child;

			if (isElement && i < (options.children || []).length - 1) {
				const isHorizontal = options.props.orientation !== Orientation.VERTICAL;
				(child as HTMLElement).style.marginRight = isHorizontal
					? itemMargin + 'px'
					: '0';
				(child as HTMLElement).style.marginBottom = isHorizontal
					? '0'
					: itemMargin + 'px';
			}
		}
	}

	// The scrollable items are always in their own div for layout purposes.
	// This is the element that deadSea will find and transform.
	const scrollArea = div({
		props: {
			className: s.carousel,
			dataset: {
				deadseaId: options.props.id || 'carousel' + Date.now(),
				deadseaOrientation: orientation || Orientation.HORIZONTAL,
				deadseaChildQuery: childQuery || '[id]', // Target direct children with an ID
				deadseaStartOffset: '0',
			},
		},
		children: options.children,
	});

	const handleNextClick = () => {
		const id = options.props.id || scrollArea.dataset.deadseaId;
		if (id) {
			const nextEl = deadSeaService.page(id, 'forward');
			if (nextEl) {
				navigationService.moveFocus(nextEl);
			}
		}
	};

	const handlePrevClick = () => {
		const id = options.props.id || scrollArea.dataset.deadseaId;
		if (id) {
			const prevEl = deadSeaService.page(id, 'backward');
			if (prevEl) navigationService.moveFocus(prevEl);
		}
	};

	const wrapperChildren: HTMLElement[] = [scrollArea];

	if (showArrows) {
		const isVertical = options.props.orientation === Orientation.VERTICAL;
		const prevButton = Button({
			props: {
				className: `prev ${s.arrow} ${s.prev} lrud-ignore`,
				onclick: handlePrevClick,
			},
			children: isVertical ? '↑' : '←',
		});

		const nextButton = Button({
			props: {
				className: `next ${s.arrow} ${s.next} lrud-ignore`,
				onclick: handleNextClick,
			},
			children: isVertical ? '↓' : '→',
		});
		wrapperChildren.push(prevButton);
		wrapperChildren.push(nextButton);
	}

	// This div acts as the positioning context for the arrows.
	// It wraps the scrollArea and the arrows themselves.
	const scrollAndArrowWrapper = div({
		props: {
			className: s.scrollAndArrowWrapper,
		},
		children: wrapperChildren,
	});

	const orientationClass =
		options.props.orientation === Orientation.VERTICAL
			? s.vertical
			: s.horizontal;

	const content = [];

	if (heading) {
		content.push(
			h2({
				props: { className: s.heading },
				children: heading,
			})
		);
	}
	content.push(scrollAndArrowWrapper);

	return section({
		props: {
			...rest,
			// The section is the LRUD container and the positioning context for the arrows.
			className: `lrud-container ${s.carouselWrapper} ${orientationClass} ${options.props.className || ''}`,
			style: { width: width, height: height },
			dataset: {
				// LRUD-specific attributes live on the container.
				...options.props?.dataset,
				blockExit: blockExit || '',
				wrap: wrap ? 'true' : 'false',
				backStop: backStop,
			},
		},
		children: content,
	});
}
