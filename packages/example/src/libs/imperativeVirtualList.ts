import type { DirectionType } from 'crt';

import {
	Direction,
	getBaseFontSize,
	removeElement,
	transformProp,
	pxToRem,
} from 'crt';

export interface ImperativeVirtualListOptions<T> {
	data: T[];
	container: string;
	renderRow: (item: T) => HTMLElement;
	elHeight: number;
	bufferAmount?: number;
	visibleEls?: number;
}

export interface ImperativeVirtualListInstance<T> {
	data: T[];
	visibleEls: number;
	bufferAmount: number;
	container: string;
	containerEl: HTMLElement | null;
	renderRow: (item: T) => HTMLElement;
	sliderEl: HTMLElement;
	elHeight: number;
	paddingTop: number;
	window: number[];
	init: () => void;
	getNextData: (start: number, end: number) => T[];
	updateList: (direction: DirectionType, position: number) => void;
}

/**
 * @template T
 * @param options
 */
export function createImperativeVirtualList<T>(options: ImperativeVirtualListOptions<T>): ImperativeVirtualListInstance<T> {
	const vl: ImperativeVirtualListInstance<T> = {
		data: options.data,
		visibleEls: options.visibleEls || 10,
		bufferAmount: options.bufferAmount || 5,
		container: options.container,
		containerEl: null,
		renderRow: options.renderRow,
		sliderEl: document.createElement('div'),
		elHeight: 0,
		paddingTop: 0,
		window: [],

		init() {
			this.containerEl = document.querySelector(this.container);
			this.window = [0, this.visibleEls - 1];

			const slice = this.getNextData(0, this.visibleEls);

			slice.forEach((bd) => {
				const el = this.renderRow(bd);
				el.style.height = this.elHeight + 'rem';
				this.sliderEl.appendChild(el);
			});

			if (this.containerEl) {
				this.containerEl.appendChild(this.sliderEl);
			}
		},

		getNextData(start, end) {
			return this.data.slice(start, end);
		},

		updateList(direction: DirectionType, position: number) {
			const lowerBound = this.window[0];
			const upperBound = this.window[1];

			const transformValue =
				'translateY(' + -(position * this.elHeight) + 'rem)';
			this.sliderEl.style.setProperty(transformProp, transformValue);

			// ::: SCROLLING DOWN
			if (
				direction === Direction.DOWN &&
				position > lowerBound + this.visibleEls + this.bufferAmount
			) {
				// Shift the window down: remove from top, add to bottom.
				for (let i = 0; i < this.visibleEls; i++) {
					if (this.sliderEl.children[0]) {
						removeElement(this.sliderEl.children[0]);
					}
				}
				const frag = document.createDocumentFragment();
				const slice = this.getNextData(
					upperBound + 1,
					upperBound + 1 + this.visibleEls
				);
				slice.forEach((bd) => {
					const el = this.renderRow(bd);
					el.style.height = this.elHeight + 'rem';
					frag.appendChild(el);
				});
				this.sliderEl.appendChild(frag);
				this.paddingTop = this.paddingTop + this.visibleEls * this.elHeight;
				this.sliderEl.style.paddingTop = this.paddingTop + 'rem';
				this.window[0] = this.window[0] + this.visibleEls;
				this.window[1] = this.window[1] + this.visibleEls;
			} else if (
				direction === Direction.DOWN &&
				position >= upperBound - this.bufferAmount
			) {
				// Just append a new page to the bottom.
				const frag = document.createDocumentFragment();
				const slice = this.getNextData(
					upperBound + 1,
					upperBound + 1 + this.visibleEls
				);
				slice.forEach((bd) => {
					const el = this.renderRow(bd);
					el.style.height = this.elHeight + 'rem';
					frag.appendChild(el);
				});
				this.sliderEl.appendChild(frag);
				this.window[1] = this.window[1] + this.visibleEls;
			}

			// ::: SCROLLING UP
			if (
				direction === Direction.UP &&
				position <= lowerBound + this.bufferAmount
			) {
				// When scrolling up, we only need to prepend. Virtualization (removing from the bottom)
				// is not implemented in this simple version, but could be added for memory optimization
				// on extremely long lists.
				const frag = document.createDocumentFragment();
				const slice = this.getNextData(
					lowerBound - this.visibleEls,
					lowerBound
				);

				slice.forEach((bd) => {
					const el = this.renderRow(bd);
					el.style.height = this.elHeight + 'rem';
					frag.appendChild(el);
				});

				this.sliderEl.prepend(frag);

				this.paddingTop = this.paddingTop - slice.length * this.elHeight;
				this.sliderEl.style.paddingTop = this.paddingTop + 'rem';
				this.window[0] = Math.max(this.window[0] - this.visibleEls, 0);
			}
		},
	};

	vl.sliderEl.style.transition = 'transform 250ms ease';
	const baseFontSize = getBaseFontSize();
	vl.elHeight = pxToRem(options.elHeight, baseFontSize);

	return vl;
}
