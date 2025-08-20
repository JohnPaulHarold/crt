import {
    AdditionalKeys,
    handleKeydownOnElement,
    normaliseEventTarget,
} from 'crt';
import { focusInto, setLrudScope } from '../navigation.js';

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
    /** @type { import('crt/types').keydownCallback }  */
    const popupCallback = (event) => {
        const elTarget = normaliseEventTarget(event);

        if (elTarget instanceof HTMLElement) {
            handler(elTarget.id);
        }
    };

    const cleanup = handleKeydownOnElement(popupEl, popupCallback, [
        AdditionalKeys.ENTER,
    ]);

    return {
        open: () => {
            outlet.appendChild(popupEl);
            outlet.classList.add('open');
            setLrudScope(popupEl);
            focusInto(popupEl);
            handler('open');
        },
        close: () => {
            outlet.classList.remove('open');
            setLrudScope(undefined); // Explicitly clear the scope
            handler('close');
            outlet.removeChild(popupEl);
            cleanup();
        },
    };
}
