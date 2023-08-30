/**
 * @callback keydownCallback
 * @param {KeyboardEvent} event
 */

import { assertKey } from '../keys';

/**
 * @param {HTMLElement} el
 * @param {keydownCallback} callback
 * @param {string[]} [allowedKeys]
 */
export function handleKeydownOnElement(el, callback, allowedKeys) {
    /**
     * @name func
     * @param {KeyboardEvent} e 
     */
    function func(e) {
        if ((allowedKeys && assertKey(e, allowedKeys)) || !allowedKeys) {
            callback(e);
        }
    }

    el.addEventListener('keydown', func);

    return () => {
        el.removeEventListener('keydown', func);
    };
}
