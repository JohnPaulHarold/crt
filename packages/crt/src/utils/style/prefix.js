export const transformProp = (function () {
	// This is a browser-only utility. In a server environment, return a default.
	if (typeof document === 'undefined') {
		return 'transform';
	}

	const testEl = document.createElement('div');
	if (testEl.style.transform == null) {
		const vendors = ['webkit', 'Webkit', 'Moz', 'ms'];
		for (const vendor in vendors) {
			// @ts-ignore
			if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
				return vendors[vendor] + 'Transform';
			}
		}
	}
	return 'transform';
})();
