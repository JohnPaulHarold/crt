/**
 * @typedef {import('../declarations/types').DrmSupportsLevelsProps} DrmSupportsLevelsProps
 */
import { div } from "../libs/makeElement";
import { getClassesWithFeature } from "../utils/getClassesWithFeature";
import s from "./Codec.css";

/**
 *
 * @param {DrmSupportsLevelsProps} props
 * @returns {Element}
 */
export const DrmSupportsLevels = ({ data }) => {
  const l1 = data?.find(
    (/** @type {{name: string, supported: string}} level */ level) =>
      level.name === "L1"
  )?.supported;

  const l2 = data?.find(
    (/** @type {{name: string, supported: string}} level */ level) =>
      level.name === "L2"
  )?.supported;

  const l3 = data?.find(
    (/** @type {{name: string, supported: string}} level */ level) =>
      level.name === "L3"
  )?.supported;

  return !!l1 || !!l2 || !!l3
    ? div(
        { style: { overflow: "hidden" } },
        div(
          {
            className: getClassesWithFeature(l1, s.levelbox, s),
          },
          "L1"
        ),

        div(
          {
            className: getClassesWithFeature(l2, s.levelbox, s),
          },
          "L2"
        ),

        div(
          {
            className: getClassesWithFeature(l3, s.levelbox, s),
          },
          "L3"
        )
      )
    : div("");
};
