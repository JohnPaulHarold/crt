import { cx } from 'crt';
import { div, section } from '../html.js';
import { Button } from './Button.js';

import s from './Keyboard.scss';

export interface KeyboardKey {
	display: string;
	value: string;
	width?: number;
}

export type KeyProps = KeyboardKey & {
	className?: string;
};

export interface KeyboardProps {
	keyMap: KeyboardKey[][];
}

/**
 *
 * @param props
 */
const KeyButton = (props: KeyProps): HTMLElement => {
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
 * @param props
 */
export const Keyboard = (props: KeyboardProps): HTMLElement => {
	return (
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
