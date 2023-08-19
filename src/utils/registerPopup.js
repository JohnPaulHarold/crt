import { AdditionalKeys } from '../enums/AdditionalKeys';
import { appOutlets } from '../main';
import { focusInto, setLrudScope } from '../navigation';
import { handleKeydownOnElement } from './handleKeydownOnElement';

/**
 * @name registerPopup
 * @param {HTMLElement} popupEl
 * @param {(id: string) => void} handler
 * @returns {{open: () => void, close: () => void}}
 */
export function registerPopup(popupEl, handler) {
    const popupsOutlet = appOutlets['popups'];
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
            popupsOutlet.appendChild(popupEl);

            popupsOutlet.classList.add('open');
            setLrudScope(popupEl);
            focusInto(popupEl);
            handler('open');
        },
        // creator wants to manually close the popup
        close: () => {
            popupsOutlet.classList.remove('open');
            setLrudScope();
            handler('close');
            cleanup();
        },
    };

    return api;
}
