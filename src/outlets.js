/**
 * @typedef {import('./declarations/types.js').AppOutlets} AppOutlets
 */

// todo: could these be acquired as part of bootstrap process
// injected into each BaseView class?
/** @type {AppOutlets} */
export const appOutlets = {};

/**
 * @name initOutlets
 * @param {string[]} outletIds
 */
export function initOutlets(outletIds) {
    outletIds.forEach((id) => {
        const el = document.getElementById(id);

        if (el) {
            appOutlets[id] = el;
        }
    });

    return appOutlets;
}
