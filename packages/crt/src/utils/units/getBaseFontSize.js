/**
 * Queries the document stylesheet and casts the font size in pixels as a number
 * @param {HTMLElement} [el]
 * @returns {number}
 */
export function getBaseFontSize(el) {
	// This is a browser-only utility. In a server environment, return a sensible default.
	// The pxToRem function defaults to 10, so we'll use that for consistency.
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return 10;
	}

	const targetEl = el || document.documentElement;
	const base = getComputedStyle(targetEl).fontSize;
	const baseFontSize = parseInt(base.replace('px', ''), 10);

	return baseFontSize;
}
