/**
 * Queries the document stylesheet and casts the font size in pixels as a number
 * @returns {number}
 */
export function getBaseFontSize() {
  const base = getComputedStyle(document.documentElement).fontSize;
  const baseFontSize = parseInt(base.replace('px', ''), 10);

  return baseFontSize
}