/**
 * @param {string} searchParams
 * @returns {{[index: string]: string|number|boolean}}
 */
export function parseSearchParams(searchParams) {
    if (!searchParams) return {};

    return searchParams.split('&').reduce((acc, cur) => {
        const [key, value] = cur.split('=');
        acc[key] = value;

        return acc;
    }, /** @type {Record<string, string>} */ ({}));
}
