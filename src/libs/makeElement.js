/**
 * @typedef {import('../declarations/types').StylesRecord} StylesRecord
 * @typedef {import('../declarations/types').ShorthandMakeElement} ShorthandMakeElement
 */

const attributeExceptions = ['role'];

/**
 * appendText
 * @param {HTMLElement} el
 * @param {string} text
 */
function appendText(el, text) {
    const textNode = document.createTextNode(text);
    el.appendChild(textNode);
}

/**
 * appendArray
 * @param {HTMLElement} el
 * @param {string[] | Element[] | Array<unknown>} children
 */
function appendArray(el, children) {
    children.forEach((child) => {
        if (Array.isArray(child)) {
            appendArray(el, child);
        } else if (child instanceof window.Element) {
            el.appendChild(child);
        } else if (typeof child === 'string') {
            appendText(el, child);
        }
    });
}

/**
 * setStyles
 * @param {HTMLElement} el
 * @param {CSSStyleDeclaration} styles
 * @returns
 */
function setStyles(el, styles) {
    if (!styles) {
        el.removeAttribute('styles');
        return;
    }

    Object.keys(styles).forEach((styleName) => {
        if (styleName in el.style) {
            // @ts-ignore see https://github.com/microsoft/TypeScript/issues/17827
            el.style[styleName] = styles[styleName];
        } else {
            console.warn(
                `${styleName} is not a valid style for a <${el.tagName.toLowerCase()}>`
            );
        }
    });
}

/**
 * setData
 * @param {HTMLElement} el
 * @param {Record<string, string>} dataset
 */
function setData(el, dataset) {
    Object.keys(dataset).forEach((datakey) => {
        el.dataset[datakey] = dataset[datakey];
    });
}

/**
 * makeElement
 * @param {string} type
 * @param {string | Record<string, any> | HTMLElement} textOrPropsOrChild
 * @param  {HTMLElement[]} otherChildren
 * @see {@link https://david-gilbertson.medium.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff}
 *
 * @returns {HTMLElement}
 */
export function makeElement(type, textOrPropsOrChild, ...otherChildren) {
    const el = document.createElement(type);

    if (Array.isArray(textOrPropsOrChild)) {
        appendArray(el, textOrPropsOrChild);
    } else if (textOrPropsOrChild instanceof window.Element) {
        el.appendChild(textOrPropsOrChild);
    } else if (typeof textOrPropsOrChild === 'string') {
        appendText(el, textOrPropsOrChild);
    } else if (typeof textOrPropsOrChild === 'object') {
        Object.keys(textOrPropsOrChild).forEach((propName) => {
            if (propName in el || attributeExceptions.indexOf(propName) > -1) {
                const value = textOrPropsOrChild[propName];

                if (propName === 'dataset') {
                    setData(el, value);
                } else if (propName === 'style') {
                    setStyles(el, value);
                } else if (value) {
                    // @ts-ignore fixme
                    el[propName] = value;
                }
            } else {
                console.warn(
                    `${propName} is not a valid property of a <${type}>`
                );
            }
        });
    }

    if (otherChildren) appendArray(el, otherChildren);

    return el;
}

/** @type {ShorthandMakeElement}  */
export const nav = (...args) => makeElement('nav', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const section = (...args) =>
    makeElement('section', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const div = (...args) => makeElement('div', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const span = (...args) => makeElement('span', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const a = (...args) => makeElement('a', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const button = (...args) =>
    makeElement('button', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const h1 = (...args) => makeElement('h1', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const h2 = (...args) => makeElement('h2', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const header = (...args) =>
    makeElement('header', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const p = (...args) => makeElement('p', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const ol = (...args) => makeElement('ol', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const ul = (...args) => makeElement('ul', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const li = (...args) => makeElement('li', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const img = (...args) => makeElement('img', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const form = (...args) => makeElement('form', args[0], ...args.slice(1));
