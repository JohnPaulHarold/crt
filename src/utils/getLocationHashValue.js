/**
 *
 * @param {string} href
 * @returns {string}
 */
export function getLocationHashValue(href) {
  return href.split('#')[1];
}
