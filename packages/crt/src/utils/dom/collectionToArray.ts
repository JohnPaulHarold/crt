/**
 * @template T
 * @param collection
 */
export function collectionToArray<T>(
	collection: HTMLCollection | NodeList | NamedNodeMap
): Array<T> {
	return Array.prototype.slice.call(collection);
}
