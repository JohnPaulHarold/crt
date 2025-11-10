import { h, HOptions } from 'crt';

export type ShorthandMakeElement<K extends keyof HTMLElementTagNameMap> = (
	options?: HOptions
) => HTMLElementTagNameMap[K];

/**
 * A factory function to create a shorthand element creator with a fixed arity.
 * This directly calls the fixed-arity `h` function.
 */
const createShorthand = <K extends keyof HTMLElementTagNameMap>(tag: K) => {
	return (options?: HOptions): HTMLElementTagNameMap[K] => {
		return h(tag, options);
	};
};

export const nav = createShorthand('nav');
export const section = createShorthand('section');
export const div = createShorthand('div');
export const span = createShorthand('span');
export const a = createShorthand('a');
export const button = createShorthand('button');
export const h1 = createShorthand('h1');
export const h2 = createShorthand('h2');
export const h3 = createShorthand('h3');
export const h4 = createShorthand('h4');
export const h5 = createShorthand('h5');
export const h6 = createShorthand('h6');
export const header = createShorthand('header');
export const p = createShorthand('p');
export const ol = createShorthand('ol');
export const ul = createShorthand('ul');
export const li = createShorthand('li');
export const img = createShorthand('img');
export const pre = createShorthand('pre');
export const main = createShorthand('main');
