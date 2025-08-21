/**
 * @typedef {import('crt').ComponentProps & {
 *  blockExit?: string;
 *  childQuery?: string;
 *  id: string;
 *  orientation: Orientation;
 *  startOffset?: number;
 *  title?: string;
 *  backStop?: string;
 *  scrollStartQuery?: string;
 * }} CarouselProps
 */

import { cx, Orientation } from 'crt';

import { animations } from '../config/animations.js';
import { div, section } from '../h.js';
import { toTitleCase } from '../utils/string/toTitleCase.js';

import { Heading } from './Heading.js';

import s from './Carousel.scss';

/**
 *
 * @param {CarouselProps} props
 * @param {HTMLElement | HTMLElement[]} children
 * @returns {HTMLElement}
 */
export const Carousel = (props, children) => {
	const orientation = `orient${toTitleCase(props.orientation)}`;
	const transitions = animations.transitions
		? animations.transforms
			? s.transition
			: s.transitionNoTransform
		: '';
	const sectionCx = cx(s.carousel, props.className || '', s[orientation]);
	const sliderCx = cx(s.carouselSlider, transitions);
	const headingId = props.title ? `heading-${props.id}` : undefined;

	// Add positional data attributes to each child element for accessibility announcements.
	const childElements = Array.isArray(children) ? children : [children];
	const totalItems = childElements.length;

	childElements.forEach((child, index) => {
		if (child instanceof HTMLElement) {
			// Use 1-based index for user-facing announcements.
			child.dataset.itemIndex = String(index + 1);
			child.dataset.totalItems = String(totalItems);
		}
	});

	return section(
		{
			id: props.id,
			className: sectionCx,
			role: 'region', // 'role' is not an ARIA attribute, so it stays top-level
			aria: {
				labelledby: headingId,
			},
			dataset: {
				blockExit: props.blockExit,
			},
		},
		props.title &&
			Heading(
				{ id: headingId, level: 'h2', className: s.carouselTitle },
				props.title
			),
		div(
			{
				className: sliderCx,
				role: 'group', // 'role' is not an ARIA attribute
				aria: {
					labelledby: headingId,
					orientation: props.orientation,
				},
				dataset: {
					deadseaId: props.id,
					deadseaStartOffset: props.startOffset || 0,
					deadseaOrientation: props.orientation,
					deadseaChildQuery: props.childQuery || '',
					deadseaScrollStartQuery: props.scrollStartQuery || '',
					backStop: props.backStop || '',
				},
			},
			childElements
		)
	);
};
