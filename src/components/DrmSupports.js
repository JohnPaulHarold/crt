/**
 * @typedef {import('../declarations/types').DrmSupportsProps} DrmSupportsProps
 */
import { div } from '../libs/makeElement';
import { cx } from '../utils/cx';
import { getValidationClass } from '../utils/getValidationClass';
import s from './Codec.css';
import { DrmSupportsLevels } from './DrmSupportsLevels';

/**
 *
 * @param {DrmSupportsProps} props
 * @returns {Element}
 */
export const DrmSupports = ({ data, drmType }) =>
  div(
    {
      className: cx(s.box, getValidationClass(data[drmType].drm?.supported, s)),
    },
    div(
      drmType,
      DrmSupportsLevels({
        data: data[drmType].drm?.securityLevels,
      }),
    ),
  );
