/**
 * @param {boolean} feature
 * @param {{valid: any, invalid: any}} css
 */
export function getValidationClass(feature, css) {
	return feature ? css.valid : css.invalid;
}
