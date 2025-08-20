import { collectionToArray } from 'crt';

/**
 *
 * @param {HTMLElement} img
 * @param {number} [postBounds]
 */
function isImageInViewport(img, postBounds) {
    const pb = postBounds || 0;
    const bounds = img.getBoundingClientRect();

    if (bounds.top < document.body.clientHeight + pb) {
        return true;
    }

    return false;
}

/**
 *
 * @param {HTMLElement} scope
 * @param {number} [postBounds]
 */
export function checkImages(scope, postBounds) {
    // Be more specific with the query to ensure we only get image elements.
    const qs = "img[data-loaded='false']";
    const nodes = collectionToArray(scope.querySelectorAll(qs));

    // Add a JSDoc type to the 'node' parameter to resolve the implicit 'any' error.
    nodes.forEach((/** @type {HTMLImageElement} */ node) => {
        if (isImageInViewport(node, postBounds)) {
            // Check for data-src to avoid errors.
            if (node.dataset.src) {
                // Mark as loading immediately to prevent reprocessing.
                node.dataset.loaded = 'true';
                node.onload = () => {
                    node.classList.add('loaded');
                };
                node.src = node.dataset.src; // Trigger the image load.
            }
        }
    });
}
