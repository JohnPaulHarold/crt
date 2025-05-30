/**
 * Represents the types of input that can be considered a child or a collection of children
 * for an HTML element. This can be:
 * - A single string (for a text node).
 * - A single HTMLElement.
 * - An array containing strings, HTMLElements, or other nested arrays of the same (any[] for deeper nesting).
 * @typedef {string | HTMLElement | Array<string | HTMLElement | any[]>} ChildInput
 */

/**
 * Type definition for the shorthand element creation functions (e.g., div, span).
 * @typedef {function(...any): HTMLElement} ShorthandMakeElement
 */

const attributeExceptions = [
    'role',
    'd',
    'r',
    'cx',
    'cy',
    'width',
    'height',
    'viewBox',
    'fill',
    'for',
];

/**
 * @param {HTMLElement} el
 * @param {string} text
 */
function appendText(el, text) {
    const textNode = document.createTextNode(text);
    el.appendChild(textNode);
}

/**
 * @param {HTMLElement} el
 * @param {Array<string | Element | Array<any>>} children - An array of child elements.
 *   Each element can be a string (for a text node), an Element, or another array of children
 *   (allowing for nested structures). The `Array<any>` allows for deeper, less strictly-typed nesting
 *   if necessary, though the primary expectation is `string | Element`.
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
 * @param {HTMLElement} el
 * @param {Record<string, string>} dataset
 */
function setData(el, dataset) {
    Object.keys(dataset).forEach((datakey) => {
        el.dataset[datakey] = dataset[datakey];
    });
}

/**
 * @param {string} type
 * @param {Record<string, any> | ChildInput} [textOrPropsOrChild] - Optional.
 *   Either an object of attributes/properties for the element,
 *   or the first child/collection of children (string, HTMLElement, or array of ChildInput).
 * @param {ChildInput[]} otherChildren - Additional children to append. Each argument
 *   is treated as a child or a collection of children.
 * @see {@link https://david-gilbertson.medium.com/how-i-converted-my-react-app-to-vanillajs-and-whether-or-not-it-was-a-terrible-idea-4b14b1b2faff}
 *
 * @returns {HTMLElement}
 * @example makeElement('div', { id: 'foo' }, 'Hello', makeElement('span', 'World'))
 */
export function makeElement(type, textOrPropsOrChild, ...otherChildren) {
    const el = document.createElement(type);

    if (Array.isArray(textOrPropsOrChild)) {
        appendArray(el, textOrPropsOrChild);
    } else if (textOrPropsOrChild instanceof window.Element) {
        el.appendChild(textOrPropsOrChild);
    } else if (typeof textOrPropsOrChild === 'string') {
        appendText(el, textOrPropsOrChild);
    } else if (
        typeof textOrPropsOrChild === 'object' &&
        textOrPropsOrChild !== null && // Ensure it's not null
        !Array.isArray(textOrPropsOrChild) // Ensure it's not an array (already handled)
    ) {
        Object.keys(textOrPropsOrChild).forEach((propName) => {
            if (propName in el || attributeExceptions.indexOf(propName) > -1) {
                const value = textOrPropsOrChild[propName];

                if (propName === 'dataset') {
                    setData(el, value);
                } else if (propName === 'style') {
                    setStyles(el, value);
                } else if (typeof value === 'number' || value) {
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

    // otherChildren is an array of ChildInput elements.
    // appendArray expects a single array, so we pass otherChildren directly.
    // It will iterate through each ChildInput in otherChildren.
    if (otherChildren.length > 0) appendArray(el, otherChildren);

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
export const h3 = (...args) => makeElement('h3', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const h4 = (...args) => makeElement('h4', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const h5 = (...args) => makeElement('h5', args[0], ...args.slice(1));
/** @type {ShorthandMakeElement}  */
export const h6 = (...args) => makeElement('h6', args[0], ...args.slice(1));
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
export const pre = (...args) => makeElement('pre', args[0], ...args.slice(1));

/** @type {ShorthandMakeElement}  */
export const main = (...args) => makeElement('main', args[0], ...args.slice(1));