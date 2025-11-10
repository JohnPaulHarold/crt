/**
 * @readonly
 * @enum {string}
 */
export const Direction = {
	LEFT: 'left',
	RIGHT: 'right',
	UP: 'up',
	DOWN: 'down',
};

export type DirectionType = (typeof Direction)[keyof typeof Direction];
