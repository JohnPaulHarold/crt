/**
 * @file A custom Node.js module loader to handle non-JS imports during SSR.
 */

/**
 * The `load` hook is called by Node.js when it needs to load a module.
 * We intercept requests for `.scss` files and return an empty module.
 * @param url The URL of the module to load.
 * @param context Contextual information about the module.
 * @param nextLoad The next loader in the chain.
 */
export function load(
	url: string,
	context: object,
	nextLoad: (url: string, context: object) => void
) {
	if (url.endsWith('.scss')) {
		// Return an empty module that exports a default empty object.
		// This prevents the "unknown file extension" error.
		return {
			format: 'module',
			source: 'export default {}',
			shortCircuit: true,
		};
	}
	// For all other files, use the default loader.
	return nextLoad(url, context);
}
