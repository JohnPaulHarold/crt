/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div, h2 } from '../libs/makeElement';
import { DrmType } from '../enums/DrmType';

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
            h2(title),
            div(codec),
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
        DrmSupports({ data, drmType: DrmType.WIDEVINE }),
        DrmSupports({ data, drmType: DrmType.PLAYREADY }),
        DrmSupports({ data, drmType: DrmType.PLAYREADY_LEGACY }),
        DrmSupports({ data, drmType: DrmType.FAIRPLAY })
    );
};
