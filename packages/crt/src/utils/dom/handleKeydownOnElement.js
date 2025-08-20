import { assertKey } from '../keys';

/**
 * @param {HTMLElement} el
 * @param {import('../../types').keydownCallback} callback
 * @param {string[]} [allowedKeys]
 */
export function handleKeydownOnElement(el, callback, allowedKeys) {
    /**
     * @param {KeyboardEvent | MouseEvent} e
     */
    function func(e) {
        if (e instanceof MouseEvent) {
            callback(e);
        } else {
            if ((allowedKeys && assertKey(e, allowedKeys)) || !allowedKeys) {
                callback(e);
            }
        }
    }

    // el.addEventListener('keydown', func);
    el.addEventListener('click', func);

    return () => {
        // el.removeEventListener('keydown', func);
        el.addEventListener('click', func);
    };
}
