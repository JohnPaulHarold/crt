/**
 * @param feature
 * @param css
 */
export function getValidationClass(feature: boolean, css: { valid: any; invalid: any; }) {
	return feature ? css.valid : css.invalid;
}
