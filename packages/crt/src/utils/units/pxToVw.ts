export function pxToVw(w: number): number {
	// This is a browser-only utility. In a server environment, there is no viewport width.
	if (typeof window === 'undefined') {
		return 0; // Return 0 as there is no viewport context.
	}
	return (w / window.innerWidth) * 100;
}
