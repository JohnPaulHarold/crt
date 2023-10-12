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
export const DrmSupportsLevels = ({ data, levels }) => {
    return div(
        { style: { overflow: 'hidden' } },
        levels && levels.length > 0
            ? levels.map((level) =>
                  div(
                      {
                          className: cx(
                              s.levelbox,
                              getValidationClass(
                                  getLevelSupport(data, level),
                                  s
                              )
                          ),
                      },
                      level
                  )
              )
            : div('')
    );
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
            console.log(levelName);
            return level.name === levelName;
        })) === null ||
        _data === void 0
        ? void 0
        : _data.supported;
}
