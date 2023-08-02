/**
 * Converts a px value to vw
 * @param {number} w 
 * @returns {number}
 */
export function pxToVw(w) {
  return w / window.innerWidth * 100
}