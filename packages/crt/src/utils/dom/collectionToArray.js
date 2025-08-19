/**
 * @template T
 * @param {HTMLCollection|NodeList|NamedNodeMap} collection
 * @returns {Array<T>}
 */
export function collectionToArray(collection) {
    return Array.prototype.slice.call(collection);
}
