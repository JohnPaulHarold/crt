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
    {
      className: getClassesWithFeature(data[drmType].drm?.supported, s.box, s),
    },
    div(
      drmType,
      DrmSupportsLevels({
        data: data[drmType].drm?.securityLevels,
      })
    )
  );
