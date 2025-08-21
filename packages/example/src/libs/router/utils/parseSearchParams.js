/**
 * A simple utility to parse a search string into an object.
 * It also attempts to convert values to numbers or booleans.
 * @param {string} [searchParams]
 * @returns {Record<string, string|number|boolean>}
 */
export function parseSearchParams(searchParams) {
	if (!searchParams) return {};
	if (!searchParams) return {};

	/** @type {Record<string, string | number | boolean>} */
	const params = {};

	searchParams.split('&').forEach((param) => {
		if (!param) return;
		let [key, value] = param.split('=');
		// Use `value || ''` to handle valueless keys like `?foo&bar`
		const decodedValue = decodeURIComponent(value || '');

		if (decodedValue === 'true') {
			params[key] = true;
		} else if (decodedValue === 'false') {
			params[key] = false;
		} else if (decodedValue.trim() !== '' && !isNaN(Number(decodedValue))) {
			params[key] = Number(decodedValue);
		} else {
			params[key] = decodedValue;
		}
	});

	return params;
}
