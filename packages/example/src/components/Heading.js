import { cx } from 'crt';
import { h1, h2, h3, h4, h5, h6 } from '../h.js';

import s from './Heading.scss';

/**
 * @typedef {import('crt').ComponentProps & {
 *  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
 *  colour?: 'primary' | 'secondary' | 'highlight' | 'disabled' | 'error';
 * }} HeadingProps
 */

/**
 *
 * @param {HeadingProps} props
 * @param {*} children
 * @returns
 */
export function Heading(props, children) {
	let el = h1;
	const level = props.level || 'h1';
	switch (level) {
		case 'h2':
			el = h2;
			break;
		case 'h3':
			el = h3;
			break;
		case 'h4':
			el = h4;
			break;
		case 'h5':
			el = h5;
			break;
		case 'h6':
			el = h6;
			break;
		default:
			el = h1;
			break;
	}

	const cxHeading = cx(
		'heading',
		props.className || '',
		props.colour ? s[props.colour] : s.primary
	);

	return el({ id: props.id || '', className: cxHeading }, children);
}
