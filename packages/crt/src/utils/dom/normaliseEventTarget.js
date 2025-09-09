/**
 * @description
 * Ensures a reliable DOM element is returned from an event.
 *
 * In some edge cases, especially with keyboard navigation, `event.target` can
 * be ambiguous (e.g., the `window` object or `null`). This function provides a
 * safe fallback to `document.activeElement` in such cases, ensuring that
 * event handlers always have a meaningful element to operate on.
 *
 * @param {KeyboardEvent | MouseEvent} event The event object.
 * @returns {EventTarget | Element | null} The normalized event target.
 */
export function normaliseEventTarget(event) {
	// This is a browser-only utility. In a server environment, return null.
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return null;
	}

	return event.target && event.target !== window
		? event.target
		: document.activeElement;
}
