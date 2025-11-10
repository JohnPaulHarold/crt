/**
 * @param target
 */
export function getElementChain(
	target: Element | ParentNode
): Array<Element | ParentNode | Node> {
	let a = target;
	const els = [];

	while (target && a && a.parentNode) {
		els.unshift(a);
		a = a.parentNode;
	}

	return els;
}
