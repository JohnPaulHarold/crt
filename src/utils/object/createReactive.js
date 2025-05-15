/**
 * @template { {[index: string]: string|number|boolean} } T - T must be an object with primitive values
 *
 * @param { T } state
 * @param {(state: T) => void} onSet
 * @returns { T & { locals: T } }
 * @todo fix typechecks
 */
export function createReactive(state, onSet) {
    /**
     * ctor variable is a flag to suppress the `onSet` callback
     * during initialisation of the reactive object
     */
    let ctor = true;

    const newObj = {};

    /**
     * The internal store
     *
     * @type {T}
     * @readonly
     */
    Object.defineProperty(newObj, 'locals', {
        enumerable: false,
        value: /** @type {T} */ {},
    });

    Object.keys(state).forEach(function (key) {
        Object.defineProperty(newObj, key, {
            enumerable: true,
            get: function () {
                return this.locals[key];
            },
            set: function (newValue) {
                this.locals[key] = newValue;
                // @ts-ignore
                !ctor && onSet(newObj.locals);
            },
        });
        // @ts-ignore
        newObj[key] = state[key];
    });

    ctor = false;

    // @ts-ignore
    return newObj;
}
