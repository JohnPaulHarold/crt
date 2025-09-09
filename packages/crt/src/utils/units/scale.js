/**
 *
 * @param {number} px
 * @param {number} [base]
 * @returns {number}
 */
export function scale(px, base) {
	// This is a browser-only utility. In a server environment, there is no viewport.
	// Return the original pixel value as a fallback.
	if (typeof window === 'undefined') {
		return px;
	}

	let _base = base || 1080;
	let ratio = _base / window.innerHeight;

	return px * ratio;
}
