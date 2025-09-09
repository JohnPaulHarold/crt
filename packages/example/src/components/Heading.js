import { h1, h2, h3, h4, h5, h6 } from '../html.js';

/**
 * @typedef {import('crt').ComponentProps & {
 *  level?: 1 | 2 | 3 | 4 | 5 | 6
 * }} HeadingProps
 */

/**
 * A component that renders a heading element of a specified level.
 * @param {HeadingProps} props
 * @param {any} children
 * @returns {HTMLHeadingElement}
 */
export const Heading = (props, children) => {
	const { level = 1, ...rest } = props;

	/**
	 * A function that creates a heading element. By giving it an explicit type,
	 * we create a "wider" type that can accept any of the h1-h6 factories.
	 * @type {(...args: any[]) => HTMLHeadingElement}
	 */
	let el = h1;

	switch (level) {
		case 2:
			el = h2;
			break;
		case 3:
			el = h3;
			break;
		case 4:
			el = h4;
			break;
		case 5:
			el = h5;
			break;
		case 6:
			el = h6;
			break;
	}

	return el(rest, children);
};
