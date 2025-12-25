import type { SignalerInstance } from 'crt-utils';
import { h } from 'crt';
import { createSignaler, scale } from 'crt-utils';

export type ScrollAlignment = 'start' | 'center';

export interface ReactiveVirtualListOptions<T> {
	dataSignaller: SignalerInstance<T[]>;
	containerHeight: number;
	renderRow: (item: T, index: number, isVisible: boolean) => HTMLElement;
	itemHeight: number;
	bufferItemCount?: number;
	gap?: number;
	animate?: boolean;
	containerTag?: keyof HTMLElementTagNameMap;
	itemWrapperTag?: keyof HTMLElementTagNameMap;
	scrollAlign?: ScrollAlignment;
}

export interface ReactiveVirtualListInstance {
	render: () => HTMLElement;
	setFocusedIndex: (index: number) => void;
	focusedIndexSignaller: SignalerInstance<number>;
}

/**
 * Creates a reactive virtual list manager.
 * This is a "dumber" component that manages the state and rendering logic,
 * but relies on a "smart" parent view to handle DOM events (like scrolling)
 * and to apply the rendered VDOM using a diffing engine.
 *
 */
export function createReactiveVirtualList<T>(
	options: ReactiveVirtualListOptions<T>
): ReactiveVirtualListInstance {
	const {
		dataSignaller,
		renderRow,
		containerHeight,
		itemHeight,
		bufferItemCount = 5,
		scrollAlign = 'center',
		gap = 0,
		animate = false,
		containerTag = 'div',
		itemWrapperTag = 'div',
	} = options;

	// Internal state managed by a signaller
	const focusedIndexSignaller = createSignaler(0);

	/**
	 * A pure function that calculates the visible window of items based on current state.
	 */
	const getRenderWindow = () => {
		const data: T[] = dataSignaller.getValue() || [];
		const focusedIndex: number = focusedIndexSignaller.getValue() || 0;
		const totalItemCount = data.length;

		const totalItemHeight = itemHeight + gap;

		if (totalItemCount === 0) {
			return { visibleItems: [], translateY: 0, startIndex: 0 };
		}

		// Calculate how many items can fit in the container, plus buffer.
		const visibleItemCount = Math.ceil(containerHeight / itemHeight);
		const windowSize = visibleItemCount + bufferItemCount * 2;

		// Determine the start index of the rendered window.
		// We want to center the focused item in the rendered window.
		let startIndex = Math.max(0, focusedIndex - Math.floor(windowSize / 2));

		// Ensure the window doesn't go past the end of the data.
		if (startIndex + windowSize > totalItemCount) {
			startIndex = Math.max(0, totalItemCount - windowSize);
		}

		const endIndex = Math.min(totalItemCount, startIndex + windowSize);

		const visibleItems = data.slice(startIndex, endIndex);

		// ::: TranslateY Calculation
		// We want to scroll to keep the focused item in view.
		// A good target is to keep it near the center of the container.
		const scrollOffset = focusedIndex * totalItemHeight;
		let centeringOffset = 0;
		if (scrollAlign === 'center') {
			centeringOffset = containerHeight / 2 - totalItemHeight / 2;
		}
		let translateY = Math.max(0, scrollOffset - centeringOffset);

		// Cap the scroll so we don't scroll past the end of the content.
		const totalHeight = totalItemCount * totalItemHeight - gap; // No gap after the last item
		const maxScroll = Math.max(0, totalHeight - containerHeight);
		translateY = Math.min(translateY, maxScroll);

		return { translateY, visibleItems, startIndex, endIndex };
	};

	const instance: ReactiveVirtualListInstance = {
		focusedIndexSignaller,

		render() {
			const { translateY, visibleItems, startIndex } = getRenderWindow();

			const totalHeight =
				dataSignaller.getValue().length * (itemHeight + gap) - gap;

			return h(containerTag, {
				props: {
					className: 'reactive-vlist-slider',
					style: {
						// The slider has the height of the entire list and is moved with transform. All values are scaled.
						position: 'relative',
						height: `${scale(totalHeight)}px`,
						transform: `translateY(-${scale(translateY)}px)`,
						transition: animate ? 'transform 0.2s ease-out' : 'none',
					},
				},
				// The actual rendered items
				children: visibleItems.map((item, i) => {
					const itemIndex = startIndex + i;
					// The library now creates the positioned and sized wrapper.
					return h(itemWrapperTag, {
						props: {
							style: {
								position: 'absolute',
								top: `${scale(itemIndex * (itemHeight + gap))}px`,
								left: '0',
								right: '0',
								height: `${scale(itemHeight)}px`, // Explicitly set height
							},
						},
						children: renderRow(item, itemIndex, true),
					});
				}),
			});
		},

		setFocusedIndex(newIndex) {
			focusedIndexSignaller.setValue(newIndex);
		},
	};

	return instance;
}
