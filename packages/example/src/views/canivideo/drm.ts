import { loga } from 'crt';
import { DrmLevels } from './DrmLevels';
import { DrmType, type DrmTypeType } from './DrmType';
import { KeySystem, type KeySystemType } from './KeySystem';

const logr = loga.create('drm');

export interface SecurityLevel {
	name: string;
	supported: boolean;
}

export interface IDrm {
	type: DrmTypeType;
	keySystem: KeySystemType;
	supported: boolean;
	securityLevels: SecurityLevel[];
}

function isKeySystemSupported(
	keySystem: KeySystemType,
	contentType: string,
	robustness: string = ''
): Promise<boolean> {
	if (!navigator.requestMediaKeySystemAccess) {
		return Promise.reject(false);
	}

	return navigator
		.requestMediaKeySystemAccess(keySystem, [
			{
				initDataTypes: ['cenc'],
				videoCapabilities: [
					{
						contentType,
						robustness,
					},
				],
			},
		])
		.then((access) => access.createMediaKeys())
		.then(() => true)
		.catch(() => false);
}

function getWidevine(contentType: string) {
	return Promise.all(
		[
			'HW_SECURE_ALL',
			'HW_SECURE_DECODE',
			'HW_SECURE_CRYPTO',
			'SW_SECURE_DECODE',
			'SW_SECURE_CRYPTO',
		].map((robustness) =>
			isKeySystemSupported(KeySystem.WIDEVINE, contentType, robustness).then(
				(supported) => (supported ? robustness : null)
			)
		)
	)
		.then((promisesResolved) =>
			promisesResolved.filter((robustness) => !!robustness)
		)
		.then((supportedRobustness) =>
			isKeySystemSupported(KeySystem.WIDEVINE, contentType).then(
				(supported) => ({
					type: DrmType.WIDEVINE,
					keySystem: KeySystem.WIDEVINE,
					supported,
					securityLevels: [
						{
							name: DrmLevels.L1,
							supported: supportedRobustness.includes('HW_SECURE_ALL'),
						},
						{
							name: DrmLevels.L2,
							supported: supportedRobustness.includes('HW_SECURE_CRYPTO'),
						},
						{
							name: DrmLevels.L3,
							supported: supportedRobustness.includes('SW_SECURE_CRYPTO'),
						},
					],
				})
			)
		)
		.catch((e) => {
			logr.log('[getWidevine] failed', e);
		});
}

function getPlayreadyLegacy(contentType: string) {
	return isKeySystemSupported(KeySystem.PLAYREADY_LEGACY, contentType).then(
		(supported) => ({
			type: DrmType.PLAYREADY_LEGACY,
			keySystem: KeySystem.PLAYREADY_LEGACY,
			supported,
			securityLevels: [],
		})
	);
}

// see https://github.com/videojs/videojs-contrib-eme/blob/33dfe13b64024f099561ce86c253a27ed6194b8a/src/cdm.js#L27
// and: https://github.com/shaka-project/shaka-player/issues/818#issuecomment-405695770
function getPlayready(contentType: string) {
	return Promise.all(
		['150', '2000', '3000'].map((robustness) =>
			isKeySystemSupported(KeySystem.PLAYREADY, contentType, robustness).then(
				(supported) => (supported ? robustness : null)
			)
		)
	)
		.then((promisesResolved) =>
			promisesResolved.filter((robustness) => !!robustness)
		)
		.then((supportedRobustness) => {
			return isKeySystemSupported(KeySystem.PLAYREADY, contentType).then(
				(supported) => ({
					type: DrmType.PLAYREADY,
					keySystem: KeySystem.PLAYREADY,
					supported,
					securityLevels: [
						{
							name: DrmLevels.SL150,
							supported: supportedRobustness.includes('150'),
						},
						{
							name: DrmLevels.SL2000,
							supported: supportedRobustness.includes('2000'),
						},
						{
							name: DrmLevels.SL3000,
							supported: supportedRobustness.includes('3000'),
						},
					],
				})
			);
		});
}

function getFairplay(contentType: string) {
	return isKeySystemSupported(KeySystem.FAIRPLAY, contentType).then(
		(supported) => ({
			type: DrmType.FAIRPLAY,
			keySystem: KeySystem.FAIRPLAY,
			supported,
			securityLevels: [],
		})
	);
}

export function getDrm(type: DrmTypeType, contentType: string) {
	switch (type) {
		case DrmType.WIDEVINE:
			return getWidevine(contentType);
		case DrmType.PLAYREADY:
			return getPlayready(contentType);
		case DrmType.PLAYREADY_LEGACY:
			return getPlayreadyLegacy(contentType);
		case DrmType.FAIRPLAY:
			return getFairplay(contentType);
		default:
			throw Error('NO DRM TYPE');
	}
}
