import { getPlatform } from '../../platform.js';

/**
 * Converts a camelCase string to kebab-case.
 * This is necessary because `dataset` properties are camelCase,
 * but their corresponding HTML attributes are kebab-case.
 * @param {string} str The string to convert.
 * @returns {string}
 */
const camelToKebab = (str) =>
	str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
/**
 * @param {HTMLElement} el
 * @param {string} dataProp
 * @param {string|boolean|number|object} value
 */
export function $dataSet(el, dataProp, value) {
	if (!el || !dataProp || value == null) {
		// return an error?
		return;
	}
	// probably only need to call JSON.stringify
	// if the value is complex
	const type = typeof value;
	const platform = getPlatform();
	const attributeName = `data-${camelToKebab(dataProp)}`;

	if (type === 'string') {
		platform.setAttribute(el, attributeName, String(value));
	} else {
		platform.setAttribute(el, attributeName, JSON.stringify(value));
	}
}
