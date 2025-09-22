import { cx } from 'crt';
import { div, section } from '../html.js';
import { Button } from './Button.js';

import s from './Keyboard.scss';

/**
 * @typedef {object} KeyboardKey
 * @property {string} display
 * @property {string} value
 * @property {number} [width]
 */

/**
 * @typedef {KeyboardKey & {
 *  className?: string
 * }} KeyProps
 */

/**
 * @typedef {object} KeyboardProps
 * @property {KeyboardKey[][]} keyMap
 */

/**
 *
 * @param {KeyProps} props
 * @returns {HTMLElement}
 */
const KeyButton = (props) => {
	const buttonCx = cx(
		'keyboard-key',
		s.keyboardKey,
		typeof props.width === 'number' && s['w' + props.width]
	);

	return Button(
		{
			className: buttonCx,
			id: `keyboard-key-${props.value.toLowerCase()}`,
			dataset: {
				keyValue: props.value,
			},
		},
		props.display
	);
};

/**
 *
 * @param {KeyboardProps} props
 * @returns {HTMLElement}
 */
export const Keyboard = (props) => {
	return /** @type {HTMLElement} */ (
		section(
			{ className: s.keyboard },
			props.keyMap.map((row) =>
				div(
					{ className: s.keyboardRow },
					row.map((key) => KeyButton(key))
				)
			)
		)
	);
};
