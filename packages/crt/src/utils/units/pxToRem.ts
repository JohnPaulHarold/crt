/**
 * Converts a pixel value to a rem value based on a root font size.
 * @param px The pixel value to convert.
 * @param baseFontSize The root font size in pixels.
 * @returns The value in rems.
 */
export function pxToRem(px: number, baseFontSize: number = 10): number {
	if (
		typeof px !== 'number' ||
		typeof baseFontSize !== 'number' ||
		baseFontSize === 0
	) {
		return 0;
	}
	return px / baseFontSize;
}
