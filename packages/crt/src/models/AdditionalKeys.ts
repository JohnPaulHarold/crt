/**
 * @readonly
 * @enum {string}
 */
export const AdditionalKeys = {
	ENTER: 'enter',
	BACKSPACE: 'backspace',
	ESCAPE: 'escape',
	RED: 'red',
	YELLOW: 'yellow',
	GREEN: 'green',
	BLUE: 'blue',
};

export type AdditionalKeysType =
	(typeof AdditionalKeys)[keyof typeof AdditionalKeys];
