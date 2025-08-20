import { loga } from 'crt';
import { DrmLevels } from './DrmLevels';
import { DrmType } from './DrmType';
import { KeySystem } from './KeySystem';

const logr = loga.create('drm');

/**
 * @typedef {object} SecurityLevel
 * @property {string} name
 * @property {boolean} supported
 */

/**
 * @typedef {object} IDrm
 * @property {DrmType} type
 * @property {KeySystem} keySystem
 * @property {boolean} supported
 * @property {SecurityLevel[]} securityLevels
 */

/**
 * @param {KeySystem} keySystem
 * @param {string} contentType
 * @param {string} robustness
 * @returns {Promise<boolean>}
 */
function isKeySystemSupported(keySystem, contentType, robustness = '') {
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

/**
 * @param {string} contentType
 */
function getWidevine(contentType) {
    return Promise.all(
        [
            'HW_SECURE_ALL',
            'HW_SECURE_DECODE',
            'HW_SECURE_CRYPTO',
            'SW_SECURE_DECODE',
            'SW_SECURE_CRYPTO',
        ].map((robustness) =>
            isKeySystemSupported(
                KeySystem.WIDEVINE,
                contentType,
                robustness
            ).then((supported) => (supported ? robustness : null))
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
                            supported:
                                supportedRobustness.includes('HW_SECURE_ALL'),
                        },
                        {
                            name: DrmLevels.L2,
                            supported:
                                supportedRobustness.includes(
                                    'HW_SECURE_CRYPTO'
                                ),
                        },
                        {
                            name: DrmLevels.L3,
                            supported:
                                supportedRobustness.includes(
                                    'SW_SECURE_CRYPTO'
                                ),
                        },
                    ],
                })
            )
        )
        .catch((e) => {
            logr.log('[getWidevine] failed', e);
        });
}

/**
 * @param {string} contentType
 */
function getPlayreadyLegacy(contentType) {
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
/**
 * @param {string} contentType
 */
function getPlayready(contentType) {
    return Promise.all(
        ['150', '2000', '3000'].map((robustness) =>
            isKeySystemSupported(
                KeySystem.PLAYREADY,
                contentType,
                robustness
            ).then((supported) => (supported ? robustness : null))
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

/**
 * @param {string} contentType
 */
function getFairplay(contentType) {
    return isKeySystemSupported(KeySystem.FAIRPLAY, contentType).then(
        (supported) => ({
            type: DrmType.FAIRPLAY,
            keySystem: KeySystem.FAIRPLAY,
            supported,
            securityLevels: [],
        })
    );
}

/**
 * @namegetDrm
 * @param {DrmType} type
 * @param {string} contentType
 */
export function getDrm(type, contentType) {
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
