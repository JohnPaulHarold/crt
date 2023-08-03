/**
 * @typedef {import('../declarations/types').CodecProps} CodecProps
 */

import { div } from "../libs/makeElement";
import { DrmType } from "../enums/DrmType";

import s from "./Codec.css";
import { cx } from "../utils/cx";

// TODO rename
// @ts-ignore
function getClassesWithFeature(feature, classes) {
  return `${Array.isArray(classes) ? classes.join(", ") : classes} ${
    feature ? s.valid : s.invalid
  }`;
}

/**
 *
 * @param {CodecProps} props
 * @returns {Element}
 */
export const Codec = ({ data }) => {
  return div(
    { className: s.container },
    Object.keys(data).map((key) =>
      div(
        { className: s.container },
        div(
          {
            className: getClassesWithFeature(
              !!data[key].mse || !!data[key].video,
              s.box
            ),
          },
          `${key}`
        ),
        div(
          {
            className: getClassesWithFeature(data[key].mse, s.halfbox),
          },
          "MSE"
        ),
        div(
          {
            className: getClassesWithFeature(data[key].video, s.halfbox),
          },
          "<video />"
        ),
        div(
          {
            className: getClassesWithFeature(
              data[key][DrmType.WIDEVINE].drm?.supported,
              s.box
            ),
          },
          DrmType.WIDEVINE
        ),
        div(
          {
            className: getClassesWithFeature(
              data[key][DrmType.WIDEVINE].drm?.securityLevels?.find(
                (
                  /** @type {{name: string, supported: string}} level */ level
                ) => level.name === "L1"
              )?.supported,
              s.thirdbox
            ),
          },
          "L1"
        ),
        div(
          {
            className: getClassesWithFeature(
              data[key][DrmType.WIDEVINE].drm?.securityLevels?.find(
                (
                  /** @type {{name: string, supported: string}} level */ level
                ) => level.name === "L2"
              )?.supported,
              s.thirdbox
            ),
          },
          "L2"
        ),
        div(
          {
            className: getClassesWithFeature(
              data[key][DrmType.WIDEVINE].drm?.securityLevels?.find(
                (
                  /** @type {{name: string, supported: string}} level */ level
                ) => level.name === "L3"
              )?.supported,
              s.thirdbox
            ),
          },
          "L3"
        ),
        div(
          {
            className: `${s.box} ${
              data[key][DrmType.FAIRPLAY].drm?.supported ? s.valid : s.invalid
            }`,
          },
          DrmType.FAIRPLAY
        ),
        div(
          { className: s.thirdbox },
          "L1 " +
            data[key][DrmType.FAIRPLAY].drm?.securityLevels?.find(
              (/** @type {{name: string, supported: string}} level */ level) =>
                level.name === "L1"
            )?.supported
        ),
        div(
          { className: s.thirdbox },
          "L2 " +
            data[key][DrmType.FAIRPLAY].drm?.securityLevels?.find(
              (/** @type {{name: string, supported: string}} level */ level) =>
                level.name === "L2"
            )?.supported
        ),
        div(
          { className: s.thirdbox },
          "L3 " +
            data[key][DrmType.FAIRPLAY].drm?.securityLevels?.find(
              (/** @type {{name: string, supported: string}} level */ level) =>
                level.name === "L3"
            )?.supported
        ),
        div(
          {
            className: `${s.box} ${
              data[key][DrmType.PLAYREADY].drm?.supported ? s.valid : s.invalid
            }`,
          },
          DrmType.PLAYREADY
        ),
        div(
          { className: s.thirdbox },
          "L1 " +
            data[key][DrmType.PLAYREADY].drm?.securityLevels?.find(
              (/** @type {{name: string, supported: string}} level */ level) =>
                level.name === "L1"
            )?.supported
        ),
        div(
          { className: s.thirdbox },
          "L2 " +
            data[key][DrmType.PLAYREADY].drm?.securityLevels?.find(
              (/** @type {{name: string, supported: string}} level */ level) =>
                level.name === "L2"
            )?.supported
        ),
        div(
          { className: s.thirdbox },
          "L3 " +
            data[key][DrmType.PLAYREADY].drm?.securityLevels?.find(
              (/** @type {{name: string, supported: string}} level */ level) =>
                level.name === "L3"
            )?.supported
        )
      )
    )
  );
};
