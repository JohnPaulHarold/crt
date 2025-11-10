export function scale(px: number, base?: number): number {
	// This is a browser-only utility. In a server environment, there is no viewport.
	// Return the original pixel value as a fallback.
	if (typeof window === 'undefined') {
		return px;
	}

	const _base = base || 1080;
	const ratio = _base / window.innerHeight;

	return px * ratio;
}
