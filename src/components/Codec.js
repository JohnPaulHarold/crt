/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div, h2 } from "../libs/makeElement";
import { DrmType } from "../enums/DrmType";

import s from "./Codec.css";
import { DrmSupports } from "./DrmSupports";
import { getClassesWithFeature } from "../utils/getClassesWithFeature";

/**
 *
 * @param {CodecProps} props
 * @returns {Element}
 */
export const Codec = ({ data, codec }) => {
  return div(
    { className: s.container },
    div(
      {
        className: getClassesWithFeature(!!data.mse || !!data.video, s.box, s),
      },
      h2(codec),
      div(
        {
          className: getClassesWithFeature(data.mse, s.box, s),
        },
        "MSE"
      ),
      div(
        {
          className: getClassesWithFeature(data.video, s.box, s),
        },
        "<video />"
      )
    ),
    DrmSupports({ data, drmType: DrmType.WIDEVINE }),
    DrmSupports({ data, drmType: DrmType.PLAYREADY }),
    DrmSupports({ data, drmType: DrmType.FAIRPLAY })
  );
};
