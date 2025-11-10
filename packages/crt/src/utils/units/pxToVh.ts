/**
 * Converts a px value to vh
 */
export function pxToVh(h: number): number {
	// This is a browser-only utility. In a server environment, there is no viewport height.
	if (typeof window === 'undefined') {
		return 0; // Return 0 as there is no viewport context.
	}
	return (h / window.innerHeight) * 100;
}
