import { normaliseEventTarget } from 'crt';
import { navigationService } from '../services/navigationService.js';

/**
 * @typedef {object} RegisteredPopup
 * @property {() => void} open
 * @property {() => void} close
 */

/**
 * @param {HTMLElement} popupEl
 * @param {(id: string) => void} handler
 * @param {HTMLElement} outlet
 * @returns {RegisteredPopup}
 */
export function registerPopup(popupEl, handler, outlet) {
    /**
     * @param {MouseEvent} event
     */
    const handleClick = (event) => {
        const elTarget = normaliseEventTarget(event);

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
