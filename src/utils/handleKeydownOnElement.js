/**
 * @callback keydownCallback
 * @param {KeyboardEvent} event
 */

/**
 * @param {HTMLElement} el
 * @param {keydownCallback} callback
 */
export function handleKeydownOnElement(el, callback) {
  el.addEventListener('keydown', callback);

  return function () {
    el.removeEventListener('keydown', callback);
  };
}
