/**
 * @readonly
 * @enum {string}
 */
export const Orientation = {
	VERTICAL: 'vertical',
	HORIZONTAL: 'horizontal',
};

export type OrientationType = (typeof Orientation)[keyof typeof Orientation];
