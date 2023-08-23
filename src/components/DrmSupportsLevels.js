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
    var _data, _data2, _data3;
    var l1 =
        (_data = data) === null ||
        _data === void 0 ||
        (_data = _data.find(function (level) {
            return level.name === 'L1';
        })) === null ||
        _data === void 0
            ? void 0
            : _data.supported;
    var l2 =
        (_data2 = data) === null ||
        _data2 === void 0 ||
        (_data2 = _data2.find(function (level) {
            return level.name === 'L2';
        })) === null ||
        _data2 === void 0
            ? void 0
            : _data2.supported;
    var l3 =
        (_data3 = data) === null ||
        _data3 === void 0 ||
        (_data3 = _data3.find(function (level) {
            return level.name === 'L3';
        })) === null ||
        _data3 === void 0
            ? void 0
            : _data3.supported;

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
