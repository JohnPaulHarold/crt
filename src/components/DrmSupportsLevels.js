/**
 * @typedef {import('../declarations/types').DrmSupportsLevelsProps} DrmSupportsLevelsProps
 */
import { div } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';
import { getValidationClass } from '../utils/getValidationClass';
import s from './Codec.css';

/**
 *
 * @param {DrmSupportsLevelsProps} props
 * @returns {Element}
 */
export const DrmSupportsLevels = ({ data }) => {
    const l1 = getLevelSupport(data, 'L1');
    const l2 = getLevelSupport(data, 'L2');
    const l3 = getLevelSupport(data, 'L3');

    return !!l1 || !!l2 || !!l3
        ? div(
              { style: { overflow: 'hidden' } },
              div(
                  {
                      className: cx(s.levelbox, getValidationClass(l1, s)),
                  },
                  'L1'
              ),

              div(
                  {
                      className: cx(s.levelbox, getValidationClass(l2, s)),
                  },
                  'L2'
              ),

              div(
                  {
                      className: cx(s.levelbox, getValidationClass(l3, s)),
                  },
                  'L3'
              )
          )
        : div('');
};

/**
 *
 * @param {any[]} data
 * @param {string} levelName
 * @returns {boolean}
 */
function getLevelSupport(data, levelName) {
    let _data;
    return (_data = data) === null ||
        _data === void 0 ||
        (_data = _data.find(function (level) {
            return level.name === levelName;
        })) === null ||
        _data === void 0
        ? void 0
        : _data.supported;
}
