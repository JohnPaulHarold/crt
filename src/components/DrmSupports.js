/**
 * @typedef {import('../declarations/types').DrmSupportsProps} DrmSupportsProps
 */
import { div } from "../libs/makeElement";
import { getClassesWithFeature } from "../utils/getClassesWithFeature";
import s from "./Codec.css";
import { DrmSupportsLevels } from "./DrmSupportsLevels";

/**
 *
 * @param {DrmSupportsProps} props
 * @returns {Element}
 */
export const DrmSupports = ({ data, drmType }) =>
  div(
    div(
      {
        className: getClassesWithFeature(
          data[drmType].drm?.supported,
          s.thirdbox,
          s
        ),
      },
      drmType
    ),
    DrmSupportsLevels({
      data: data[drmType].drm?.securityLevels,
    })
  );
