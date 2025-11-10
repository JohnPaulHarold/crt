import type { ComponentProps } from 'crt';
import { img } from '../html.js';

import s from './LazyImage.scss';

export type LazyImageProps = ComponentProps & {
	src: string;
};

interface LazyImageOptions {
	props: LazyImageProps;
}

export const LazyImage = (options: LazyImageOptions): HTMLElement => {
	return img({
		props: {
			dataset: {
				src: options.props.src,
				fallback: '',
				loaded: false,
			},
			className:
				'lazy-image ' +
				s.lazyImage +
				(options.props.className ? ' ' + options.props.className : ''),
			src: options.props.src,
		},
	});
};
