import { getPlatform } from '../../platform.js';

export function removeElement(el: HTMLElement | Element): void {
	if (el.parentElement) {
		const platform = getPlatform();
		platform.removeChild(el.parentElement, el);
	}
}
