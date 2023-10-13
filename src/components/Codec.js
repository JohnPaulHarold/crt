/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div, h2 } from '../libs/makeElement';
import { DrmType } from '../models/DrmType';

import s from './Codec.css';
import { DrmSupports } from './DrmSupports';
import { getValidationClass } from '../utils/getValidationClass';
import { cx } from '../utils/dom/cx';

/**
 *
 * @param {CodecProps} props
 * @returns {Element}
 */
export const Codec = ({ data, codec, title }) => {
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
