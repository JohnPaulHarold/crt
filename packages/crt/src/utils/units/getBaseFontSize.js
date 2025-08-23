/**
 * Queries the document stylesheet and casts the font size in pixels as a number
 * @param {HTMLElement} [el]
 * @returns {number}
 */
export function getBaseFontSize(el) {
	const targetEl = el || document.documentElement;
	const base = getComputedStyle(targetEl).fontSize;
	const baseFontSize = parseInt(base.replace('px', ''), 10);

	return baseFontSize;
}
