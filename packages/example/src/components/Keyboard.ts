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
interface KeyButtonOptions {
	props: KeyProps;
}

const KeyButton = (options: KeyButtonOptions): HTMLElement => {
	const buttonCx = cx(
		'keyboard-key',
		s.keyboardKey,
		typeof options.props.width === 'number' && s['w' + options.props.width]
	);

	return Button({
		props: {
			className: buttonCx,
			id: `keyboard-key-${options.props.value.toLowerCase()}`,
			dataset: {
				keyValue: options.props.value,
			},
		},
		children: options.props.display,
	});
};

interface KeyboardOptions {
	props: KeyboardProps;
}

/**
 *
 * @param props
 */
export const Keyboard = (options: KeyboardOptions): HTMLElement => {
	return section({
		props: { className: s.keyboard },
		children: options.props.keyMap.map((row) =>
			div({
				props: { className: s.keyboardRow },
				children: row.map((key) => KeyButton({ props: key })),
			})
		),
	});
};
