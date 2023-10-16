/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div } from '../libs/makeElement';
import { DrmType } from '../models/DrmType';

import s from './Codec.css';
import { cx } from '../utils/dom/cx';
import { getValidClass } from '../utils/getValidClass';
import { DrmNames } from '../models/DrmNames';

/**
 *
 * @param {CodecProps} props
 * @returns {Element}
 */
export const Codec = ({ data, codec, title }) => {
    return div(
        { className: s['codec-wrapper'] },
        div(
            {
                className: cx(
                    s['title-wrapper'],
                    s.box,
                    s[getValidClass(data.mse || data.video)]
                ),
            },
            div({ className: s.title }, title),
            div(codec)
        ),
        div(
            { className: s.half },
            div(
                {
                    className: cx(
                        s['text-center'],
                        s['float-left'],
                        s.box,
                        s[getValidClass(data.mse)]
                    ),
                },
                'MSE'
            ),
            div(
                {
                    className: cx(
                        s['text-center'],
                        s['float-left'],
                        s.box,
                        s[getValidClass(data.video)]
                    ),
                },
                '<video />'
            )
        ),
        div(
            { className: cx(s['text-center'], s.clear, s.whole) },
            div(
                {
                    className: cx(
                        s['title-wrapper'],
                        s.box,
                        s[
                            getValidClass(
                                data[DrmType.WIDEVINE].drm.supported ||
                                    data[DrmType.PLAYREADY].drm.supported ||
                                    data[DrmType.PLAYREADY_LEGACY].drm
                                        .supported ||
                                    data[DrmType.FAIRPLAY].drm.supported
                            )
                        ]
                    ),
                },
                'DRM'
            )
        ),
        div(
            { className: s.quarter },
            div(
                { className: s['float-left'] },
                div(
                    {
                        className: cx(
                            s['text-center'],
                            s.box,
                            s[
                                getValidClass(
                                    data[DrmType.WIDEVINE].drm.supported
                                )
                            ]
                        ),
                    },
                    DrmNames[DrmType.WIDEVINE]
                ),
                div(
                    { className: s.third },
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box,
                                s[
                                    getValidClass(
                                        data[
                                            DrmType.WIDEVINE
                                        ].drm.securityLevels.find(
                                            /**
                                             * @param {{name: string}} level
                                             * @returns {boolean}
                                             */
                                            (level) => level.name === 'L1'
                                        ).supported
                                    )
                                ]
                            ),
                        },
                        'L1'
                    ),
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box,
                                s[
                                    getValidClass(
                                        data[
                                            DrmType.WIDEVINE
                                        ].drm.securityLevels.find(
                                            /**
                                             * @param {{name: string}} level
                                             * @returns {boolean}
                                             */
                                            (level) => level.name === 'L2'
                                        ).supported
                                    )
                                ]
                            ),
                        },
                        'L2'
                    ),
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box,
                                s[
                                    getValidClass(
                                        data[
                                            DrmType.WIDEVINE
                                        ].drm.securityLevels.find(
                                            /**
                                             * @param {{name: string}} level
                                             * @returns {boolean}
                                             */
                                            (level) => level.name === 'L3'
                                        ).supported
                                    )
                                ]
                            ),
                        },
                        'L3'
                    )
                )
            ),
            div(
                { className: s['float-left'] },
                div(
                    {
                        className: cx(
                            s['text-center'],
                            s.box,
                            s[
                                getValidClass(
                                    data[DrmType.PLAYREADY].drm.supported
                                )
                            ]
                        ),
                    },
                    DrmNames[DrmType.PLAYREADY]
                ),
                div(
                    { className: s.third },
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box,
                                data[DrmType.PLAYREADY].drm.securityLevels.find(
                                    /**
                                     * @param {{name: string}} level
                                     * @returns {boolean}
                                     */
                                    (level) => level.name === 'SL150'
                                ).supported
                            ),
                        },
                        'SL150'
                    ),
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box,
                                data[DrmType.PLAYREADY].drm.securityLevels.find(
                                    /**
                                     * @param {{name: string}} level
                                     * @returns {boolean}
                                     */
                                    (level) => level.name === 'SL2000'
                                ).supported
                            ),
                        },
                        'SL2000'
                    ),
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box,
                                data[DrmType.PLAYREADY].drm.securityLevels.find(
                                    /**
                                     * @param {{name: string}} level
                                     * @returns {boolean}
                                     */
                                    (level) => level.name === 'SL3000'
                                ).supported
                            ),
                        },
                        'SL3000'
                    )
                )
            ),
            div(
                { className: s['float-left'] },
                div(
                    {
                        className: cx(
                            s['text-center'],
                            s['b-bottom'],
                            s.box,
                            s[
                                getValidClass(
                                    data[DrmType.PLAYREADY_LEGACY].drm.supported
                                )
                            ]
                        ),
                    },
                    DrmNames[DrmType.PLAYREADY_LEGACY]
                )
            ),
            div(
                { className: s['float-left'] },
                div(
                    {
                        className: cx(
                            s['text-center'],
                            s['b-bottom'],
                            s.box,
                            s[
                                getValidClass(
                                    data[DrmType.FAIRPLAY].drm.supported
                                )
                            ]
                        ),
                    },
                    DrmNames[DrmType.FAIRPLAY]
                )
            )
        ),
        div({ className: s.clear })
    );
};
