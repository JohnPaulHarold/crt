/**
 * A simple object to hold references to key DOM elements (outlets)
 * where different parts of the application can be rendered.
 */
export const appOutlets: Record<string, Element | null> = {
	nav: null,
	main: null,
	popups: null,
	notifications: null,
};
