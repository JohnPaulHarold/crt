/**
 * @returns {string}
 * @see {@link https://github.com/alexnault/classix/blob/main/src/index.ts}
 */
export function cx() {
    let str = '',
        i = 0,
        arg;

    for (; i < arguments.length; ) {
        if ((arg = arguments[i++]) && typeof arg === 'string') {
            str && (str += ' ');
            str += arg;
        }
    }

    return str;
}
