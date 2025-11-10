import type { BaseViewInstance, SignallerInstance } from 'crt';
import type { ReactiveVirtualListInstance } from '../libs/reactiveVirtualList.js';
import type { AppViewOptions } from '../index.js';
import type { MoveEventPayload } from './vlist.js';

import { createBaseView, createSignaller, watch, diff } from 'crt';
import { div, p, section, a } from '../html.js';
import { createReactiveVirtualList } from '../libs/reactiveVirtualList.js';
import {
	navigationService,
	NavigationEvents,
} from '../services/navigationService.js';
import { parseDecimal } from '../utils/math/parseDecimal.js';

import s from './reactiveVListView.scss';

// ::: Data Generation (copied from imperative vlist view for comparison)

interface VListItem {
	d: number;
	b: string;
	h: string;
}

function dec2bin(dec: number): string {
	return (dec >>> 0).toString(2);
}

function dec2hex(dec: number): string {
	return (dec >>> 0).toString(16);
}

function buildBigData(bigNumber: number): VListItem[] {
	const bigData: VListItem[] = [];
	for (let i = 0; i < bigNumber; i++) {
		bigData.push({
			d: i,
			b: dec2bin(i),
			h: dec2hex(i),
		});
	}
	return bigData;
}

// ::: View Implementation

function getTemplate(this: ReactiveVListViewInstance): HTMLElement {
	// The initial render just creates the container.
	// The virtual list will be diffed into it later.
	return section({
		props: {
			className: `view ${s.virtualList} lrud-container`,
			id: this.id,
			style: {
				height: '100%',
				overflow: 'hidden',
			},
		},
	});
}

type ReactiveVListViewInstance = BaseViewInstance & {
	dataSignaller: SignallerInstance<VListItem[]>;
	vl: ReactiveVirtualListInstance | null;
	stopWatching?: () => void;
	boundHandleMove?: (event: MoveEventPayload) => void;
	handleMove: (event: MoveEventPayload) => void;
};

export function createReactiveVListView(
	options: AppViewOptions
): ReactiveVListViewInstance {
	const base = createBaseView(options);

	const reactiveVListView: ReactiveVListViewInstance = Object.assign({}, base, {
		dataSignaller: createSignaller(buildBigData(600)),
		vl: null,
		stopWatching: undefined,
		boundHandleMove: undefined,

		destructor: function (this: ReactiveVListViewInstance) {
			if (this.stopWatching) {
				this.stopWatching();
			}
			if (this.boundHandleMove) {
				navigationService
					.getBus()
					// @ts-expect-error fix ths PubSub types
					.off(NavigationEvents.MOVE, this.boundHandleMove);
			}
		},

		handleMove: function (
			this: ReactiveVListViewInstance,
			event: MoveEventPayload
		) {
			if (this.vl && event.detail.nextElement) {
				const index = parseDecimal(
					event.detail.nextElement.dataset.index || '0'
				);
				this.vl.setFocusedIndex(index);
			}
		},

		viewDidLoad: function (this: ReactiveVListViewInstance) {
			if (!(this.viewEl instanceof HTMLElement)) return;

			/**
			 * Renders a single row. If the row is not visible, it renders a lightweight
			 * placeholder to keep the element focusable by lrud-spatial without the
			 * performance cost of rendering the full content. (This is now handled by the library)
			 */
			const renderRow = (
				item: VListItem,
				index: number,
				_isVisible: boolean
			): HTMLElement => {
				const content = div({
					props: { className: s.vlistItemInner },
					children: [
						p({ children: `Decimal: ${item.d}` }),
						p({ children: `Binary: ${item.b}` }),
						p({ children: `Hex: ${item.h}` }),
					],
				});

				return a({
					props: {
						className: s.vlistItem,
						href: '#',
						id: `vlist-item-${index}`, // Add a unique ID to act as a key for the diff engine
						dataset: {
							index: String(index), // Pass data attributes via the `dataset` object
						},
						onclick: (e: Event) => e.preventDefault(),
					},
					children: content,
				});
			};

			this.vl = createReactiveVirtualList({
				dataSignaller: this.dataSignaller,
				renderRow,
				itemHeight: 160, // All dimensions are in reference 1080p pixels
				gap: 20,
				animate: true, // Enable animation
				containerTag: 'ul',
				itemWrapperTag: 'li',
				scrollAlign: 'center', // Start scrolling as soon as focus hits the edge.
				containerHeight: 1080, // The reference height of the container
			});

			const initialVdom = this.vl.render();
			this.viewEl.appendChild(initialVdom);

			// Watch for changes to the focused index and re-render with a diff
			this.stopWatching = watch([this.vl.focusedIndexSignaller], () => {
				if (this.viewEl && this.vl && this.viewEl.firstChild) {
					diff(this.vl.render(), this.viewEl.firstChild);
				}
			});

			// Listen to navigation events to update the focused index
			this.boundHandleMove = this.handleMove.bind(this);
			if (this.boundHandleMove) {
				navigationService
					.getBus()
					// @ts-expect-error fix ths PubSub types
					.on(NavigationEvents.MOVE, this.boundHandleMove);
			}

			// Set initial focus on the list
			navigationService.focusInto(this.viewEl);
		},

		render: function (this: ReactiveVListViewInstance) {
			return getTemplate.call(this);
		},
	});

	return reactiveVListView;
}
