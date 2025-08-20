import { cx } from 'crt';

import { div } from '../../h';

import s from './Codec.scss';
import { DrmNames } from './DrmNames';
import { DrmType } from './DrmType';
import { DrmLevels } from './DrmLevels';
import { getValidClass } from './getValidClass';

/**
 * @typedef {object} securityLevel
 * @property {string} name
 * @property {boolean} supported
 */

/**
 * @typedef {object} DRMSupportReport
 * @property {boolean} supported
 * @property {securityLevel[]} securityLevels
 */

/**
 * @typedef {object} CodecProps
 * @property {Object<string, {
 *   drm: {
 *     supported: boolean,
 *     securityLevels: Array<securityLevel>
 *   }
 * }>} data - Object mapping string keys to DRM information for different data sources.
 * @property {string} codec - The codec string.
 * @property {string} type - The container type.
 * @property {string} title - A human-readable title for the codec/type combination.
 */

/**
 *
 * @param {string[]} list
 * @param {boolean} [valid]
 * @returns {{className: string}}
 */
const classNames = (list, valid) => ({
    className: cx(
        list.map((elm) => s[elm]).join(' ') +
            (valid ? ' ' + s[getValidClass(valid)] : '')
    ),
});

/**
 *
 * @param {securityLevel[]} list
 * @param {string} item
 * @returns {securityLevel | undefined}
 */
const find = (list, item) => {
    if (!list) return undefined;
    for (let i = 0; i < list.length; i++) {
        if (list[i].name == item) {
            return list[i];
        }
    }
    return undefined;
};

/**
 *
 * @param {CodecProps} props
 * @returns {Element}
 */
export const Codec = ({ data, codec, title }) => {
    const widevineDrm = data[DrmType.WIDEVINE].drm;
    const playreadyDrm = data[DrmType.PLAYREADY].drm;
    const playreadyLegacyDrm = data[DrmType.PLAYREADY_LEGACY].drm;
    const fairplayDrm = data[DrmType.FAIRPLAY].drm;

    const isCodecValid = !!data.mse || !!data.video;
    const isDrmValid =
        widevineDrm.supported ||
        playreadyDrm.supported ||
        playreadyLegacyDrm.supported ||
        fairplayDrm.supported;

    const widevineL1 = find(widevineDrm.securityLevels, DrmLevels.L1);
    const widevineL2 = find(widevineDrm.securityLevels, DrmLevels.L2);
    const widevineL3 = find(widevineDrm.securityLevels, DrmLevels.L3);
    const playreadySL150 = find(playreadyDrm.securityLevels, DrmLevels.SL150);
    const playreadySL2000 = find(playreadyDrm.securityLevels, DrmLevels.SL2000);
    const playreadySL3000 = find(playreadyDrm.securityLevels, DrmLevels.SL3000);

    return div(
        classNames(['codec-wrapper']),
        div(
            classNames(['title-wrapper', 'box'], isCodecValid),
            div(classNames(['title']), title),
            div(codec)
        ),
        div(
            classNames(['half']),
            div(
                classNames(['text-center', 'inline-block', 'box'], !!data.mse),
                'MSE'
            ),
            div(
                classNames(
                    ['text-center', 'inline-block', 'box'],
                    !!data.video
                ),
                '<video />'
            )
        ),
        div(
            classNames(['text-center', 'whole']),
            div(classNames(['title-wrapper', 'box'], isDrmValid), 'DRM')
        ),
        div(
            { className: s.quarter },
            div(
                { className: s['inline-block'] },
                div(
                    classNames(['text-center', 'box'], widevineDrm.supported),
                    DrmNames[DrmType.WIDEVINE]
                ),
                div(
                    { className: s.third },
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            widevineL1 && widevineL1.supported
                        ),
                        DrmLevels.L1
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            widevineL2 && widevineL2.supported
                        ),
                        DrmLevels.L2
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            widevineL3 && widevineL3.supported
                        ),
                        DrmLevels.L3
                    )
                )
            ),
            div(
                { className: s['inline-block'] },
                div(
                    classNames(['text-center', 'box'], playreadyDrm.supported),
                    DrmNames[DrmType.PLAYREADY]
                ),
                div(
                    { className: s.third },
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            playreadySL150 && playreadySL150.supported
                        ),
                        DrmLevels.SL150
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            playreadySL2000 && playreadySL2000.supported
                        ),
                        DrmLevels.SL2000
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            playreadySL3000 && playreadySL3000.supported
                        ),
                        DrmLevels.SL3000
                    )
                )
            ),
            div(
                classNames(['v-align-top', 'inline-block', 'b-bottom']),
                div(
                    classNames(
                        ['text-center', 'box'],
                        playreadyLegacyDrm.supported
                    ),
                    DrmNames[DrmType.PLAYREADY_LEGACY]
                )
            ),
            div(
                classNames(['v-align-top', 'inline-block', 'b-bottom']),
                div(
                    classNames(['text-center', 'box'], fairplayDrm.supported),
                    DrmNames[DrmType.FAIRPLAY]
                )
            )
        )
    );
};
