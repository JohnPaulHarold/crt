import { h } from 'crt';

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @typedef {(...args: any[]) => HTMLElementTagNameMap[K]} ShorthandMakeElement<K>
 */

/** @type {ShorthandMakeElement<'nav'>}  */
export const nav = (...args) => h('nav', ...args);
/** @type {ShorthandMakeElement<'section'>}  */
export const section = (...args) => h('section', ...args);
/** @type {ShorthandMakeElement<'div'>}  */
export const div = (...args) => h('div', ...args);
/** @type {ShorthandMakeElement<'span'>}  */
export const span = (...args) => h('span', ...args);
/** @type {ShorthandMakeElement<'a'>}  */
export const a = (...args) => h('a', ...args);
/** @type {ShorthandMakeElement<'button'>}  */
export const button = (...args) => h('button', ...args);
/** @type {ShorthandMakeElement<'h1'>}  */
export const h1 = (...args) => h('h1', ...args);
/** @type {ShorthandMakeElement<'h2'>}  */
export const h2 = (...args) => h('h2', ...args);
/** @type {ShorthandMakeElement<'h3'>}  */
export const h3 = (...args) => h('h3', ...args);
/** @type {ShorthandMakeElement<'h4'>}  */
export const h4 = (...args) => h('h4', ...args);
/** @type {ShorthandMakeElement<'h5'>}  */
export const h5 = (...args) => h('h5', ...args);
/** @type {ShorthandMakeElement<'h6'>}  */
export const h6 = (...args) => h('h6', ...args);
/** @type {ShorthandMakeElement<'header'>}  */
export const header = (...args) => h('header', ...args);
/** @type {ShorthandMakeElement<'p'>}  */
export const p = (...args) => h('p', ...args);
/** @type {ShorthandMakeElement<'ol'>}  */
export const ol = (...args) => h('ol', ...args);
/** @type {ShorthandMakeElement<'ul'>}  */
export const ul = (...args) => h('ul', ...args);
/** @type {ShorthandMakeElement<'li'>}  */
export const li = (...args) => h('li', ...args);
/** @type {ShorthandMakeElement<'img'>}  */
export const img = (...args) => h('img', ...args);
/** @type {ShorthandMakeElement<'pre'>}  */
export const pre = (...args) => h('pre', ...args);
/** @type {ShorthandMakeElement<'main'>}  */
export const main = (...args) => h('main', ...args);
