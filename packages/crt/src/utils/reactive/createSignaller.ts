import type { SignallerInstance } from '../../types.js';

/**
 * Creates a "signaller" object that holds a value and can notify
 * listeners when the value changes.
 * @param initialValue
 */
export function createSignaller<T>(initialValue: T): SignallerInstance<T> {
	let _value = initialValue;
	const _waiting: ((
		instance: SignallerInstance<T> | Readonly<SignallerInstance<T>>
	) => void)[] = [];

	const signaller: SignallerInstance<T> = {
		getValue: () => _value,
		setValue: (newValue) => {
			if (_value !== newValue) {
				_value = newValue;
				// Use a copy of the array in case a callback modifies the list
				const toCall = [..._waiting];
				toCall.forEach((callback) => callback(signaller));
			}
		},
		wait: (callback) => {
			_waiting.push(callback);
		},
		unwait: (callback) => {
			const index = _waiting.indexOf(callback);
			if (index > -1) {
				_waiting.splice(index, 1);
			}
		},
	};
	return signaller;
}
