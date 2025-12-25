import { collectionToArray } from 'crt-utils';

function isImageInViewport(img: HTMLElement, postBounds?: number) {
	const pb = postBounds || 0;
	const bounds = img.getBoundingClientRect();

	if (bounds.top < document.body.clientHeight + pb) {
		return true;
	}

	return false;
}

export function checkImages(scope: HTMLElement, postBounds?: number) {
	// Be more specific with the query to ensure we only get image elements.
	const qs = "img[data-loaded='false']";
	const nodes = collectionToArray<HTMLImageElement>(scope.querySelectorAll(qs));

	nodes.forEach((node) => {
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
