/**
 * @readonly
 * @enum {OrientationType}
 */
export const Orientation = {
	VERTICAL: 'vertical',
	HORIZONTAL: 'horizontal',
} as const;

export type OrientationType = (typeof Orientation)[keyof typeof Orientation];
