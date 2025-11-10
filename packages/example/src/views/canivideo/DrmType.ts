/**
 * @readonly
 */
export const DrmType = {
	WIDEVINE: 'WIDEVINE',
	PLAYREADY: 'PLAYREADY',
	PLAYREADY_LEGACY: 'PLAYREADY_LEGACY',
	FAIRPLAY: 'FAIRPLAY',
} as const;

export type DrmTypeType = (typeof DrmType)[keyof typeof DrmType];
