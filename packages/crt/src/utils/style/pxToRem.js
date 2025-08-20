/**
 * Converts a pixel value to a rem value based on a root font size.
 * @param {number} px The pixel value to convert.
 * @param {number} [baseFontSize=10] The root font size in pixels.
 * @returns {number} The value in rems.
 */
export function pxToRem(px, baseFontSize = 10) {
    if (
        typeof px !== 'number' ||
        typeof baseFontSize !== 'number' ||
        baseFontSize === 0
    ) {
        return 0;
    }
    return px / baseFontSize;
}
