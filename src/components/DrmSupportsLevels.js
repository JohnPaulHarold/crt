/**
 * @typedef {import('../declarations/types').DrmSupportsLevelsProps} DrmSupportsLevelsProps
 */
import { div } from '../libs/makeElement';
import { cx } from '../utils/cx';
import { getValidationClass } from '../utils/getValidationClass';
import s from './Codec.css';

/**
 *
 * @param {DrmSupportsLevelsProps} props
 * @returns {Element}
 */
export const DrmSupportsLevels = ({ data }) => {
  const l1 = data?.find((level) => level.name === 'L1')?.supported;
  const l2 = data?.find((level) => level.name === 'L2')?.supported;
  const l3 = data?.find((level) => level.name === 'L3')?.supported;

  return !!l1 || !!l2 || !!l3
    ? div(
        { style: { overflow: 'hidden' } },
        div(
          {
            className: cx(s.levelbox, getValidationClass(l1, s)),
          },
          'L1',
        ),

        div(
          {
            className: cx(s.levelbox, getValidationClass(l2, s)),
          },
          'L2',
        ),

        div(
          {
            className: cx(s.levelbox, getValidationClass(l3, s)),
          },
          'L3',
        ),
      )
    : div('');
};
