// Utils - Log
export { loga, LogLevel } from './utils/loga/loga.js';

// Core Types
/**
 * @typedef {import('./types.js').ComponentProps} ComponentProps
 * @typedef {import('./types.js').ViewOptions} ViewOptions
 * @typedef {import('./types.js').BaseViewInstance} BaseViewInstance
 * @typedef {import('./types.js').SignallerInstance} SignallerInstance
 * @typedef {import('./types.js').Platform} Platform
 */
export * from './types.js'; // This ensures any actual exports from types.js are passed through.

// Platform
export { setPlatform, getPlatform } from './platform.js';

// Models
export { AdditionalKeys } from './models/AdditionalKeys.js';
export { Direction } from './models/Direction.js';
export { Orientation } from './models/Orientation.js';

// Hyperscript
export { h, makeElement } from './h.js';

// Views
export { createBaseView } from './createBaseView.js';

// Reactive
export { createReactive } from './utils/object/createReactive.js';
export { createSignaller } from './utils/reactive/createSignaller.js';
export { watch } from './utils/reactive/watch.js';

// Utils - DOM
export { $dataGet } from './utils/dom/$dataGet.js';
export { $dataSet } from './utils/dom/$dataSet.js';
export { normaliseEventTarget } from './utils/dom/normaliseEventTarget.js';
export { removeElement } from './utils/dom/removeElement.js';
export { cx } from './utils/dom/cx.js';

// Utils - Input
export { assertKey, getDirectionFromKeyCode } from './utils/keys.js';

// Utils - Style, units
export { pxToRem } from './utils/units/pxToRem.js';
export { getBaseFontSize } from './utils/units/getBaseFontSize.js';
export { scale } from './utils/units/scale.js';
export { transformProp } from './utils/style/prefix.js';

export { collectionToArray } from './utils/dom/collectionToArray.js';

export { createThrottle } from './utils/function/throttle.js';
export { createDebounce } from './utils/function/debounce.js';
export { noop } from './utils/function/noop.js';

// VDOM
export { diff, stringToHTML } from './differenceEngine.js';

// async
export { request } from './utils/async/request.js';
