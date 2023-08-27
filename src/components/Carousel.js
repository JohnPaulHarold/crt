/**
 * @typedef {import('../declarations/types').CarouselProps} CarouselProps
 */
import { animations } from '../config/animations';
import { div, section } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';
import { toTitleCase } from '../utils/string/toTitleCase';

import s from './Carousel.css';
import { Heading } from './Heading';
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

    return section(
        {
            id: props.id,
            className: sectionCx,
            dataset: {
                blockExit: props.blockExit,
            },
        },
        props.title &&
            Heading({ level: 'h2', className: s.carouselTitle }, props.title),
        div(
            {
                className: sliderCx,
                dataset: {
                    deadseaId: props.id,
                    deadseaStartOffset: props.startOffset || 0,
                    deadseaOrientation: props.orientation,
                    deadseaChildQuery: props.childQuery || '',
                    deadseaScrollStartQuery: props.scrollStartQuery || '',
                    backStop: props.backStop || '',
                },
            },
            children
        )
    );
};
