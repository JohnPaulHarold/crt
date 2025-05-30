import { img } from '../libs/makeElement';

import s from './LazyImage.scss';

/**
 * @typedef {BaseComponentProps & {
 *  src: string;
 * }} LazyImageProps
 */

/**
 *
 * @param {LazyImageProps} props
 * @returns {HTMLElement}
 */
export const LazyImage = (props) => {
    return img({
        dataset: {
            src: props.src,
            fallback: '',
            loaded: false,
        },
        className:
            'lazy-image ' +
            s.lazyImage +
            (props.className ? ' ' + props.className : ''),
        src: props.src,
    });
};
