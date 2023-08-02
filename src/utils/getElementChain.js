/**
 * getElementChain
 * @param {Element|ParentNode} target
 * @returns {Array<Element|ParentNode|Node>}
 */
export function getElementChain(target) {
  let a = target;
  const els = [];

  while (target && a && a.parentNode) {
    els.unshift(a);
    a = a.parentNode;
  }

  return els;
}
