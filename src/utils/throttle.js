/** @type {boolean} */
let throttlePause;

/**
 * 
 * @param {Function} callback 
 * @param {number} time 
 * @param {any[]} args
 * @returns {void}
 */
export const throttle = (callback, time, args) => {
  if (throttlePause) return;

  throttlePause = true;

  setTimeout(() => {
    callback(...args);
    throttlePause = false;
  }, time);
};
