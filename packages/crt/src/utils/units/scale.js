/**
 *
 * @param {number} px
 * @param {number} [base]
 * @returns {number}
 */
export function scale(px, base) {
	let _base = base || 1080;
	let ratio = _base / window.innerHeight;

	return px * ratio;
}
