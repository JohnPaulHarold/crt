import type { ComponentProps, ChildInput } from 'crt'; // ChildInput is not used here, but kept for consistency

import { cx } from 'crt';
import { button } from '../html.js';

import s from './Button.scss';

export type ButtonProps = ComponentProps & {
	text?: string;
	ghost?: boolean;
	icon?: string;
	iconPosition?: 'left' | 'right' | 'top' | 'bottom';
};

interface ButtonOptions {
	props?: ButtonProps;
	children?: ChildInput | readonly ChildInput[];
}

export const Button = (options?: ButtonOptions): HTMLElement => {
	// Default props to an empty object if not provided
	const props = options?.props || {};
	// Create a copy of the props to avoid mutating the original object.
	const allProps = Object.assign({}, props);
	// Combine the base className with any component-specific classes.
	allProps.className = cx(
		s.button,
		props.className, // Access className from props
		props.ghost ? 'ghost' : '' // Access ghost from props
	);

	// The `ghost` prop is specific to this component's styling and should not be passed to the DOM.
	delete allProps.ghost;

	return button({ props: allProps, children: options?.children });
};
