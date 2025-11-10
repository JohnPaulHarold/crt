import { getPlatform } from '../../platform.js';

/**
 * @param el
 */
export function removeElement(el: HTMLElement | Element): void {
	if (el.parentElement) {
		const platform = getPlatform();
		platform.removeChild(el.parentElement, el);
	}
}
