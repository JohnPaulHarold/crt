export function getLocationHashValue(href: string): string {
	return href.split('#')[1];
}
