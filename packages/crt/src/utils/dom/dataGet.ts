export function dataGet(el: HTMLElement, dataProp: string): unknown {
	const value = el.dataset && el.dataset[dataProp];

	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			return value;
		}
	}

	return '';
}
