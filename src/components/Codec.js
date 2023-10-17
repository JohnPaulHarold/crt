/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 * @typedef {import('../declarations/types').securityLevel} securityLevel
 */

import { div } from '../libs/makeElement';
import { DrmType } from '../models/DrmType';

import s from './Codec.css';
import { cx } from '../utils/dom/cx';
import { getValidClass } from '../utils/getValidClass';
import { DrmNames } from '../models/DrmNames';

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
const find = (list, item) => list.find((level) => level.name === item);

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

    const widevineL1 = find(widevineDrm.securityLevels, 'L1');
    const widevineL2 = find(widevineDrm.securityLevels, 'L2');
    const widevineL3 = find(widevineDrm.securityLevels, 'L3');
    const playreadySL150 = find(playreadyDrm.securityLevels, 'SL150');
    const playreadySL2000 = find(playreadyDrm.securityLevels, 'SL2000');
    const playreadySL3000 = find(playreadyDrm.securityLevels, 'SL3000');

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
                        'L1'
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            widevineL2 && widevineL2.supported
                        ),
                        'L2'
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            widevineL3 && widevineL3.supported
                        ),
                        'L3'
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
                        'SL150'
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            playreadySL2000 && playreadySL2000.supported
                        ),
                        'SL2000'
                    ),
                    div(
                        classNames(
                            ['text-center', 'inline-block', 'box'],
                            playreadySL3000 && playreadySL3000.supported
                        ),
                        'SL3000'
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
