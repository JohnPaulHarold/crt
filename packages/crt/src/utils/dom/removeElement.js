import { getPlatform } from '../../platform.js';

/**
 * @param {HTMLElement|Element} el
 * @returns {void}
 */
export function removeElement(el) {
	if (el.parentElement) {
		const platform = getPlatform();
		platform.removeChild(el.parentElement, el);
	}
}
