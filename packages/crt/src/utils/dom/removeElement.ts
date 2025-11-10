import { getPlatform } from '../../platform.js';

/**
 * @param {HTMLElement|Element} el
 * @returns {void}
 */
export function removeElement(el: HTMLElement | Element): void {
	if (el.parentElement) {
		const platform = getPlatform();
		platform.removeChild(el.parentElement, el);
	}
}
