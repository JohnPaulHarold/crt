/**
 * @param feature
 * @param css
 */
export function getValidationClass(
	feature: boolean,
	css: { valid: unknown; invalid: unknown }
) {
	return feature ? css.valid : css.invalid;
}
