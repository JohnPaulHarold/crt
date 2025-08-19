/**
 * 
 * @param {KeyboardEvent | MouseEvent} event 
 * @returns 
 */
export function normaliseEventTarget(event) {
  return event.target && event.target !== window ? event.target : document.activeElement;
}