/**
 * @readonly
 */
export const KeySystem = {
	WIDEVINE: 'com.widevine.alpha',
	PLAYREADY_LEGACY: 'com.microsoft.playready',
	PLAYREADY: 'com.microsoft.playready.recommendation',
	FAIRPLAY: 'com.apple.fps',
} as const;

export type KeySystemType = (typeof KeySystem)[keyof typeof KeySystem];
