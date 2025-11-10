/**
 * @template { {[index: string]: string|number|boolean} } T - T must be an object with primitive values
 *
 * @param { T } state
 * @param {(state: T) => void} onSet
 * @returns { T & { locals: T } }
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
	const locals = { ...state };
	const reactiveProxy = {} as T & { locals: T };

	/**
	 * The internal store
	 */
	Object.defineProperty(reactiveProxy, 'locals', {
		enumerable: false,
		value: locals,
	});

	(Object.keys(state) as Array<keyof T>).forEach(function (key) {
		Object.defineProperty(reactiveProxy, key, {
			enumerable: true,
			get(): T[keyof T] {
				return locals[key];
			},
			set(newValue: T[keyof T]) {
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
