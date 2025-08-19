export { BaseView } from './baseView.js';
export { clearDeadSeaCache, scrollAction } from './deadSea.js';
export { diff, stringToHTML } from './differenceEngine.js';
export {
    makeElement,
    a,
    button,
    div,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    header,
    img,
    li,
    main,
    nav,
    ol,
    p,
    pre,
    section,
    span,
    ul,
} from './makeElement.js';

// Models
export { AdditionalKeys } from './models/AdditionalKeys.js';
export { Direction } from './models/Direction.js';
export { Orientation } from './models/Orientation.js';

// Utils
export { collectionToArray } from './utils/dom/collectionToArray.js';
export { getBaseFontSize } from './utils/dom/getBaseFontSize.js';
export { cx } from './utils/dom/cx.js';
export { $dataGet } from './utils/dom/$dataGet.js';
export { $dataSet } from './utils/dom/$dataSet.js';
export { toTitleCase } from './utils/string/toTitleCase.js';
export { normaliseEventTarget } from './utils/dom/normaliseEventTarget.js';
export { parseSearchParams } from './utils/dom/parseSearchParams.js';
export { removeElement } from './utils/dom/removeElement.js';
export { throttle } from './utils/function/throttle.js';
export { assertKey, getDirectionFromKeyCode } from './utils/keys.js';
export { parseDecimal } from './utils/math/parseDecimal.js';
export { createReactive } from './utils/object/createReactive.js';
export { transformProp } from './utils/style/prefix.js';
export { pxToRem } from './utils/style/pxToRem.js';
export { handleKeydownOnElement } from './utils/dom/handleKeydownOnElement.js';
