import type { SignalerInstance } from '../../types.js';

/**
 * Creates a "signaller" object that holds a value and can notify
 * listeners when the value changes.
 */
export function createSignaler<T>(initialValue: T): SignalerInstance<T> {
	let _value = initialValue;
	const _waiting: ((
		instance: SignalerInstance<T> | Readonly<SignalerInstance<T>>
	) => void)[] = [];

	const signaller: SignalerInstance<T> = {
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
