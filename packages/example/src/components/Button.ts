import type { ComponentProps } from 'crt';

import { cx } from 'crt';
import { button } from '../html.js';

import s from './Button.scss';

export type ButtonProps = ComponentProps & {
	text?: string;
	ghost?: boolean;
	icon?: string;
	iconPosition?: 'left' | 'right' | 'top' | 'bottom';
};

/**
 *
 * @param props
 * @param children
 */
export const Button = (props: ButtonProps, children: string | Element): HTMLElement => {
	// Create a copy of the props to avoid mutating the original object.
	const allProps = Object.assign({}, props);
	// Combine the base className with any component-specific classes.
	allProps.className = cx(
		s.button,
		props.className,
		props.ghost ? 'ghost' : ''
	);

	// The `ghost` prop is specific to this component's styling and should not be passed to the DOM.
	delete allProps.ghost;

	return button(allProps, children);
};
