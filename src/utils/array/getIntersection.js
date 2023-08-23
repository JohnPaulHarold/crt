/**
 * getIntersection
 * @template T
 * @param {Array<T>} array1
 * @param {Array<T>} array2
 * @returns {Array<T>}
 */
export function getIntersection(array1, array2) {
    return array1.filter((n) => {
        return array2.indexOf(n) !== -1;
    });
}
