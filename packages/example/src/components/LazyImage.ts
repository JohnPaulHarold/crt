import type { ComponentProps } from 'crt';
import { img } from '../html.js';

import s from './LazyImage.scss';

export type LazyImageProps = ComponentProps & {
	src: string;
};

export const LazyImage = (props: LazyImageProps): HTMLElement => {
	return (
		img({
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
		})
	);
};
