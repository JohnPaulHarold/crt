declare module '@bbc/tv-lrud-spatial' {
	function getNextFocus(
		currentFocus?: HTMLElement,
		keyCode?: number,
		scope?: HTMLElement
	): HTMLElement | null;
	function getNextFocus(): HTMLElement | null;
}
