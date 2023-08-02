import { collectionToArray } from '../utils/collectionToArray';

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
    const qs = "[data-loaded='false']";
    const nodes = collectionToArray(scope.querySelectorAll(qs));
    nodes.forEach((node) => {
        if (isImageInViewport(node, postBounds)) {
            node.onload = function () {
                node.classList.add('loaded');
                node.onload = null;
                node.src = node.dataset.src;
                node.dataset.loaded = true;
            };

            node.src = node.dataset.src;
        }
    });
}
