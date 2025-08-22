import { div, h2, section } from '../h.js';
import { Orientation } from 'crt';
import { navigationService } from '../services/navigationService.js';
import { Button } from './Button.js';
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
 * }} CarouselProps
 */

/**
 * A scrollable container for a list of items that can be navigated
 * spatially. Integrates with `deadSea.js` for smooth scrolling.
 *
 * @param {CarouselProps} props
 * @param {HTMLElement[]} children
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

    // Apply margin directly to children to ensure it's part of the layout
    // that deadSea.js can measure correctly.
    if (itemMargin) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child instanceof HTMLElement && i < children.length - 1) {
                var isHorizontal = orientation !== Orientation.VERTICAL;
                child.style.marginRight = isHorizontal
                    ? itemMargin + 'px'
                    : '0';
                child.style.marginBottom = isHorizontal
                    ? '0'
                    : itemMargin + 'px';
            }
        }
    }

    // The scrollable items are always in their own div for layout purposes.
    // This is the element that deadSea will find and transform.
    const scrollArea = div(
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
    );

    const handleNextClick = () => {
        // This logic can be simplified by just getting the next focusable element
        // from the last visible one.
        const items = Array.from(scrollArea.children);
        if (items.length === 0) return;

        const containerRect = scrollArea.getBoundingClientRect();
        let lastVisibleItem = null;

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const itemRect = item.getBoundingClientRect();
            const isHorizontal = orientation !== Orientation.VERTICAL;

            if (isHorizontal) {
                if (
                    itemRect.left < containerRect.right &&
                    itemRect.right > containerRect.left
                ) {
                    lastVisibleItem = item;
                    break;
                }
            } else {
                if (
                    itemRect.top < containerRect.bottom &&
                    itemRect.bottom > containerRect.top
                ) {
                    lastVisibleItem = item;
                    break;
                }
            }
        }

        const lastVisibleIndex = lastVisibleItem
            ? items.indexOf(lastVisibleItem)
            : -1;
        const nextItem = items[lastVisibleIndex + 1];
        if (nextItem instanceof HTMLElement) {
            navigationService.moveFocus(nextItem);
        }
    };

    const handlePrevClick = () => {
        // This logic can be simplified by just getting the previous focusable element
        // from the first visible one.
        const items = Array.from(scrollArea.children);
        if (items.length === 0) return;

        const containerRect = scrollArea.getBoundingClientRect();
        let firstVisibleItem = null;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemRect = item.getBoundingClientRect();
            const isHorizontal = orientation !== Orientation.VERTICAL;

            if (isHorizontal) {
                if (
                    itemRect.right > containerRect.left &&
                    itemRect.left < containerRect.right
                ) {
                    firstVisibleItem = item;
                    break;
                }
            } else {
                if (
                    itemRect.bottom > containerRect.top &&
                    itemRect.top < containerRect.bottom
                ) {
                    firstVisibleItem = item;
                    break;
                }
            }
        }

        const firstVisibleIndex = firstVisibleItem
            ? items.indexOf(firstVisibleItem)
            : -1;
        const prevItem = items[firstVisibleIndex - 1];
        if (prevItem instanceof HTMLElement) {
            navigationService.moveFocus(prevItem);
        }
    };

    const content = [scrollArea];

    if (showArrows) {
        const isVertical = orientation === Orientation.VERTICAL;
        const prevButton = Button(
            {
                className: `${s.arrow} ${s.prev} lrud-ignore`,
                onclick: handlePrevClick,
            },
            isVertical ? '⌃' : '‹'
        );

        const nextButton = Button(
            {
                className: `${s.arrow} ${s.next} lrud-ignore`,
                onclick: handleNextClick,
            },
            isVertical ? '⌄' : '›'
        );
        content.push(prevButton, nextButton);
    }

    const orientationClass =
        orientation === Orientation.VERTICAL ? s.vertical : s.horizontal;

    if (heading) {
        content.unshift(h2({ className: s.heading }, heading));
    }

    return section({
        ...rest,
        // The section is the LRUD container and the positioning context for the arrows.
        className: `lrud-container ${s.carouselWrapper} ${orientationClass} ${props.className || ''}`,
        dataset: {
            // LRUD-specific attributes live on the container.
            ...props.dataset,
            blockExit: blockExit || '',
            wrap: wrap ? 'true' : 'false',
            backStop: backStop,
        },
    }, content);
}