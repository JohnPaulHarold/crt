export function getRouteParams(
	routeUrl: string,
	pattern: string
): Record<string, string> | null {
	const routeMatcher = new RegExp(
		'^' + pattern.replace(/({[^}]*(\w+)[^}]*})/g, '([\\w-]+)') + '$'
	);
	const match = routeUrl.match(routeMatcher);

	if (!match) return null;
	if (match.length < 2) return {};

	const variables = pattern.match(/({[^}]*(\w+)[^}]*})/g) || [];
	const matchedVariables = match.slice(1);
	const params: { [index: string]: string } = {};

	variables.forEach((variable, i) => {
		// strip the brackets
		const hashless = variable.replace(/{|}/g, '');
		params[hashless] = matchedVariables[i];
	});

	return params;
}
