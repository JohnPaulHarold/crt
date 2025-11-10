/**
 * Creates a "reactive" object that triggers a callback whenever one of its properties is set.
 * This is a simple implementation of the Proxy pattern for state management.
 *
 * @template T The shape of the state object.
 * @param state The initial state object.
 * @param onSet A callback function that is invoked with the new state whenever a property changes.
 * @returns A new object that looks and feels like the original state object, but with reactive setters.
 */
export function createReactive<T extends object>(
	state: T,
	onSet: (state: T) => void
): T & { locals: T } {
	/**
	 * ctor variable is a flag to suppress the `onSet` callback
	 * during initialisation of the reactive object
	 */
	let ctor = true;

	/**
	 * The internal state store. We create a copy to avoid mutating the original object.
	 */
	const locals = { ...state };

	/**
	 * The public-facing proxy object.
	 */
	const reactiveProxy = {} as T & { locals: T };

	Object.defineProperty(reactiveProxy, 'locals', {
		enumerable: false,
		value: locals,
	});

	(Object.keys(state) as Array<keyof T>).forEach(function (key) {
		// For each key in the original state, define a getter/setter on the proxy.
		Object.defineProperty(reactiveProxy, key, {
			enumerable: true,
			get(): T[keyof T] {
				return locals[key];
			},
			set(newValue: T[keyof T]) {
				if (locals[key] === newValue) return; // No change, do nothing.
				locals[key] = newValue;
				if (!ctor) {
					onSet(locals);
				}
			},
		});
	});

	ctor = false;

	return reactiveProxy;
}
