export function toTitleCase(str: string): string {
	if (typeof str !== 'string') {
		return '';
	}

	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
}
