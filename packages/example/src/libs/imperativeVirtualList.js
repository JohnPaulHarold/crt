import {
	Direction,
	getBaseFontSize,
	removeElement,
	transformProp,
	pxToRem,
} from 'crt';

/**
 * @template T
 * @typedef {object} ImperativeVirtualListOptions
 * @property {T[]} data
 * @property {string} container - A CSS selector for the container element.
 * @property {(item: T) => HTMLElement} renderRow - A function to render a single item.
 * @property {number} elHeight - The height of a single row element in pixels.
 * @property {number} [bufferAmount=5] - The number of off-screen elements to keep rendered as a buffer.
 * @property {number} [visibleEls=10] - The number of elements visible in the viewport at one time.
 */

/**
 * @template T
 * @typedef {object} ImperativeVirtualListInstance
 * @property {T[]} data
 * @property {number} visibleEls
 * @property {number} bufferAmount
 * @property {string} container
 * @property {HTMLElement | null} containerEl
 * @property {(item: T) => HTMLElement} renderRow
 * @property {HTMLElement} sliderEl
 * @property {number} elHeight
 * @property {number} paddingTop
 * @property {number[]} window
 * @property {() => void} init
 * @property {(start: number, end: number) => T[]} getNextData
 * @property {(direction: Direction, position: number) => void} updateList
 */

/**
 * @template T
 * @param {ImperativeVirtualListOptions<T>} options
 * @returns {ImperativeVirtualListInstance<T>}
 */
export function createImperativeVirtualList(options) {
	/** @type {ImperativeVirtualListInstance<T>} */
	const vl = {
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

		/**
		 * @this {ImperativeVirtualListInstance<T>}
		 */
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

		/**
		 * @this {ImperativeVirtualListInstance<T>}
		 */
		getNextData(start, end) {
			return this.data.slice(start, end);
		},

		/**
		 * @this {ImperativeVirtualListInstance<T>}
		 */
		updateList(direction, position) {
			const lowerBound = this.window[0];
			const upperBound = this.window[1];

			// @ts-ignore
			this.sliderEl.style[transformProp] =
				'translateY(' + -(position * this.elHeight) + 'rem)';

			// --- SCROLLING DOWN ---
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

			// --- SCROLLING UP ---
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
