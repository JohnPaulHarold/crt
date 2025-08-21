/**
 *
 * @param {string} routeUrl
 * @param {string} pattern
 * @returns {Record<string, string> | null}
 */
export function getRouteParams(routeUrl, pattern) {
	const routeMatcher = new RegExp(
		'^' + pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)') + '$'
	);
	const match = routeUrl.match(routeMatcher);

	if (!match) return null;
	if (match.length < 2) return {};

	const variables = pattern.match(/({[^}]*(\w+)[^}]*})/g) || [];
	const matchedVariables = match.slice(1);
	/** @type { {[index: string]: string } } */
	const params = {};

	variables.forEach((variable, i) => {
		// strip the brackets
		const hashless = variable.replace(/{|}/g, '');
		params[hashless] = matchedVariables[i];
	});

	return params;
}
