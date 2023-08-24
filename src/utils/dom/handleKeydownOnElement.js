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
    el.addEventListener('keydown', (e) => {
        if ((allowedKeys && assertKey(e, allowedKeys)) || !allowedKeys) {
            callback(e);
        }
    });

    return function () {
        el.removeEventListener('keydown', (e) => callback(e));
    };
}
