/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div, h2 } from '../libs/makeElement';
import { DrmType } from '../models/DrmType';

import s from './Codec.css';
import { DrmSupports } from './DrmSupports';
import { getValidationClass } from '../utils/getValidationClass';
import { cx } from '../utils/dom/cx';
import { getValidClass } from '../utils/getValidClass';

/**
 *
 * @param {CodecProps} props
 * @returns {Element}
 */
export const Codec2 = ({ data, codec, title }) => {
    return div(
        { className: s.container },
        div(
            {
                className: cx(
                    s.box,
                    getValidationClass(!!data.mse || !!data.video, s)
                ),
            },
            h2({ className: s.title }, title),
            div({ className: s.codec }, `Codec: ${codec}`),
            div(
                {
                    className: cx(s.box, getValidationClass(data.mse, s)),
                },
                'MSE'
            ),
            div(
                {
                    className: cx(s.box, getValidationClass(data.video, s)),
                },
                '<video />'
            )
        ),
        DrmSupports({
            data,
            drmType: DrmType.WIDEVINE,
            levels: ['L1', 'L2', 'L3'],
        }),
        DrmSupports({
            data,
            drmType: DrmType.PLAYREADY,
            levels: ['SL150', 'SL2000', 'SL3000'],
        }),
        DrmSupports({ data, drmType: DrmType.PLAYREADY_LEGACY }),
        DrmSupports({ data, drmType: DrmType.FAIRPLAY })
    );
};

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
            div({ className: cx(s['title-wrapper'], s.box) }, 'DRM')
        ),
        div(
            { className: s.quarter },
            div(
                { className: s['float-left'] },
                div(
                    { className: cx(s['text-center'], s.box) },
                    'Google Widevine'
                ),
                div(
                    { className: s.third },
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box
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
                                s.box
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
                                s.box
                            ),
                        },
                        'L3'
                    )
                )
            ),
            div(
                { className: s['float-left'] },
                div(
                    { className: cx(s['text-center'], s.box) },
                    'Microsoft PlayReady'
                ),
                div(
                    { className: s.third },
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box
                            ),
                        },
                        'SL100'
                    ),
                    div(
                        {
                            className: cx(
                                s['inline-block'],
                                s['text-center'],
                                s['float-left'],
                                s.box
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
                                s.box
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
                        className: cx(s['text-center'], s['b-bottom'], s.box),
                    },
                    'Microsoft PlayReady Legacy'
                )
            ),
            div(
                { className: s['float-left'] },
                div(
                    {
                        className: cx(s['text-center'], s['b-bottom'], s.box),
                    },
                    'Apple FairPlay'
                )
            )
        ),
        div({ className: s.clear })
    );
};
