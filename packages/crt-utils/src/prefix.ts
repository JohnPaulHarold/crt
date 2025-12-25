export const transformProp = (function () {
	// This is a browser-only utility. In a server environment, return a default.
	if (typeof document === 'undefined') {
		return 'transform';
	}

	const testEl = document.createElement('div');
	if (testEl.style.transform == null) {
		const vendors = ['webkit', 'Webkit', 'Moz', 'ms'];
		for (const vendor in vendors) {
			// perhaps consider using `el.style.getProperty`?
			// @ts-expect-error JavaScript doesn't like using the `element.style` getter
			if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
				return vendors[vendor] + 'Transform';
			}
		}
	}
	return 'transform';
})();
