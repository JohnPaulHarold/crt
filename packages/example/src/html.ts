import { h } from 'crt';

export type ShorthandMakeElement<K extends keyof HTMLElementTagNameMap> = (...args: any[]) => HTMLElementTagNameMap[K];

export const nav: ShorthandMakeElement<'nav'> = (...args) => h('nav', ...args);
export const section: ShorthandMakeElement<'section'> = (...args) => h('section', ...args);
export const div: ShorthandMakeElement<'div'> = (...args) => h('div', ...args);
export const span: ShorthandMakeElement<'span'> = (...args) => h('span', ...args);
export const a: ShorthandMakeElement<'a'> = (...args) => h('a', ...args);
export const button: ShorthandMakeElement<'button'> = (...args) => h('button', ...args);
export const h1: ShorthandMakeElement<'h1'> = (...args) => h('h1', ...args);
export const h2: ShorthandMakeElement<'h2'> = (...args) => h('h2', ...args);
export const h3: ShorthandMakeElement<'h3'> = (...args) => h('h3', ...args);
export const h4: ShorthandMakeElement<'h4'> = (...args) => h('h4', ...args);
export const h5: ShorthandMakeElement<'h5'> = (...args) => h('h5', ...args);
export const h6: ShorthandMakeElement<'h6'> = (...args) => h('h6', ...args);
export const header: ShorthandMakeElement<'header'> = (...args) => h('header', ...args);
export const p: ShorthandMakeElement<'p'> = (...args) => h('p', ...args);
export const ol: ShorthandMakeElement<'ol'> = (...args) => h('ol', ...args);
export const ul: ShorthandMakeElement<'ul'> = (...args) => h('ul', ...args);
export const li: ShorthandMakeElement<'li'> = (...args) => h('li', ...args);
export const img: ShorthandMakeElement<'img'> = (...args) => h('img', ...args);
export const pre: ShorthandMakeElement<'pre'> = (...args) => h('pre', ...args);
export const main: ShorthandMakeElement<'main'> = (...args) => h('main', ...args);
