import { normalizeEventTarget } from 'crt';
import { navigationService } from '../services/navigationService.js';

export interface RegisteredPopup {
	open: () => void;
	close: () => void;
}

export function registerPopup(
	popupEl: HTMLElement,
	handler: (id: string) => void,
	outlet: HTMLElement
): RegisteredPopup {
	const handleClick = (event: MouseEvent) => {
		const elTarget = normalizeEventTarget(event);

		if (elTarget instanceof HTMLElement) {
			handler(elTarget.id);
		}
	};

	popupEl.addEventListener('click', handleClick);

	return {
		open: () => {
			outlet.appendChild(popupEl);
			outlet.classList.add('open');
			navigationService.setScope(popupEl);
			navigationService.focusInto(popupEl);
			handler('open');
		},
		close: () => {
			outlet.classList.remove('open');
			navigationService.setScope(undefined);
			handler('close');
			outlet.removeChild(popupEl);
			popupEl.removeEventListener('click', handleClick);
		},
	};
}
