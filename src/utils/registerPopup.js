import { AdditionalKeys } from '../enums/AdditionalKeys';
import { focusInto, setLrudScope } from '../navigation';
import { handleKeydownOnElement } from './dom/handleKeydownOnElement';

/**
 * @name registerPopup
 * @param {HTMLElement} popupEl
 * @param {(id: string) => void} handler
 * @param {HTMLElement} outlet
 * @returns {{open: () => void, close: () => void}}
 */
export function registerPopup(popupEl, handler, outlet) {
    /** @type { (event: KeyboardEvent) => void }  */
    const popupCallback = (event) => {
        if (event.target instanceof HTMLElement) {
            handler(event.target.id);
        }
    };

    const cleanup = handleKeydownOnElement(popupEl, popupCallback, [
        AdditionalKeys.ENTER,
    ]);

    const api = {
        // creator wants to open the popup
        open: () => {
            outlet.appendChild(popupEl);

            outlet.classList.add('open');
            setLrudScope(popupEl);
            focusInto(popupEl);
            handler('open');
        },
        // creator wants to manually close the popup
        close: () => {
            outlet.classList.remove('open');
            setLrudScope();
            handler('close');
            outlet.removeChild(popupEl);
            cleanup();
        },
    };

    return api;
}
