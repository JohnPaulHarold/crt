/**
 * Creates a "signaller" object that holds a value and can notify
 * listeners when the value changes.
 * @param {*} initialValue
 * @returns {import('../../types.js').SignallerInstance}
 */
export function createSignaller(initialValue) {
	let _value = initialValue;
	/** @type {((instance: import('../../types.js').SignallerInstance) => void)[]} */
	const _waiting = [];

	/** @type {import('../../types.js').SignallerInstance} */
	const signaller = {
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
