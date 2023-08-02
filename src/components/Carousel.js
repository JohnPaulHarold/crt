/**
 * @typedef {import('../declarations/types').CarouselProps} CarouselProps
 */
import { animations } from "../config/animations";
import { div, h2, section } from "../libs/makeElement";
import { toTitleCase } from "../utils/toTitleCase";

import s from './Carousel.css';
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
    : '' 

  return (
    section(
      {
        id: props.id,
        className: `${s.carousel} ${props.className || ''} ${s[orientation]}`,
        dataset: {
          blockExit: props.blockExit
        }
      },
      props.title && h2({ className: s.carouselTitle }, props.title),
      div(
        {
          className: s.carouselSlider + " " + transitions,
          dataset: {
            deadseaOrientation: props.orientation,
            deadseaChildQuery: props.childQuery || '',
          },
        },
        children
      )
    )
  )
}
