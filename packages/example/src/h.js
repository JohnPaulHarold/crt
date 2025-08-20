import { h } from 'crt';

/**
 * @typedef {function(...any): HTMLElement} ShorthandMakeElement
 */

/** @type {ShorthandMakeElement}  */
export const nav = (...args) => h('nav', ...args);
/** @type {ShorthandMakeElement}  */
export const section = (...args) => h('section', ...args);
/** @type {ShorthandMakeElement}  */
export const div = (...args) => h('div', ...args);
/** @type {ShorthandMakeElement}  */
export const span = (...args) => h('span', ...args);
/** @type {ShorthandMakeElement}  */
export const a = (...args) => h('a', ...args);
/** @type {ShorthandMakeElement}  */
export const button = (...args) => h('button', ...args);
/** @type {ShorthandMakeElement}  */
export const h1 = (...args) => h('h1', ...args);
/** @type {ShorthandMakeElement}  */
export const h2 = (...args) => h('h2', ...args);
/** @type {ShorthandMakeElement}  */
export const h3 = (...args) => h('h3', ...args);
/** @type {ShorthandMakeElement}  */
export const h4 = (...args) => h('h4', ...args);
/** @type {ShorthandMakeElement}  */
export const h5 = (...args) => h('h5', ...args);
/** @type {ShorthandMakeElement}  */
export const h6 = (...args) => h('h6', ...args);
/** @type {ShorthandMakeElement}  */
export const header = (...args) => h('header', ...args);
/** @type {ShorthandMakeElement}  */
export const p = (...args) => h('p', ...args);
/** @type {ShorthandMakeElement}  */
export const ol = (...args) => h('ol', ...args);
/** @type {ShorthandMakeElement}  */
export const ul = (...args) => h('ul', ...args);
/** @type {ShorthandMakeElement}  */
export const li = (...args) => h('li', ...args);
/** @type {ShorthandMakeElement}  */
export const img = (...args) => h('img', ...args);
/** @type {ShorthandMakeElement}  */
export const pre = (...args) => h('pre', ...args);
/** @type {ShorthandMakeElement}  */
export const main = (...args) => h('main', ...args);
