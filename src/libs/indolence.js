import { collectionToArray } from "../utils/collectionToArray";

/**
 * 
 * @param {HTMLElement} img 
 */
function isImageInViewport(img) {
  const bounds = img.getBoundingClientRect();

  if (bounds.top < document.body.clientHeight) {
    return true;
  }

  return false;
}

/**
 * 
 * @param {HTMLElement} scope 
 */
export function checkImages(scope) {
  const qs = "[data-loaded='false']";
  const nodes = collectionToArray(scope.querySelectorAll(qs));
  nodes.forEach((node) => {
    if (isImageInViewport(node)) {
      node.onload = function () {
        node.classList.add("loaded");
        node.onload = null;
        node.src = node.dataset.src;
        node.dataset.loaded = true;
      }

      node.src = node.dataset.src;
    }
  })
}
