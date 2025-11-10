import type { BaseViewInstance, DirectionType } from 'crt';
import type { AppViewOptions } from '../index.js';
import type { ImperativeVirtualListInstance, ImperativeVirtualListOptions } from '../libs/imperativeVirtualList.js';

import { createBaseView } from 'crt';
import { a, div, p, section } from '../html.js';
import { createImperativeVirtualList } from '../libs/imperativeVirtualList.js';
import {
	NavigationEvents,
	navigationService,
} from '../services/navigationService.js';
import { parseDecimal } from '../utils/math/parseDecimal.js';

import s from './vlist.scss';

export interface VListItem {
	d: number;
	b: string;
	h: string;
}

function VirtualList(props: { id: string; className: string; }) {
	return section({
		className: 'virtual-list' + ' ' + props.className,
		id: props.id,
	});
}

function dec2bin(dec: number): string {
	return (dec >>> 0).toString(2);
}

function dec2hex(dec: number): string {
	return (dec >>> 0).toString(16);
}

/**
 * @param bigNumber
 */
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

export interface MoveEventPayloadDetail {
	direction: DirectionType;
	lastElement: HTMLElement;
	nextElement: HTMLElement;
	lastContainer: HTMLElement;
	nextContainer: HTMLElement;
}

export interface MoveEventPayload {
	type: string;
	detail: MoveEventPayloadDetail;
}

export type VListViewInstance = BaseViewInstance & {
	bigData: VListItem[];
	containerId: string;
	vl: ImperativeVirtualListInstance<VListItem> | null;
	boundHandleMove: ((event: any) => void) | null;
	destructor: () => void;
	viewDidLoad: () => void;
	handleMove: (event: any) => void;
	renderRow: (bd: VListItem) => HTMLElement;
	render: () => HTMLElement;
};

/**
 * @param options
 */
export function createVListView(options: AppViewOptions): VListViewInstance {
	const base = createBaseView(options);
	const vListView: VListViewInstance = Object.assign({}, base, {
		bigData: buildBigData(600),
		containerId: 'my-vlist',
		vl: null,
		boundHandleMove: null,

		destructor: function () {
			if (this.boundHandleMove) {
				navigationService
					.getBus()
					.off(NavigationEvents.MOVE, this.boundHandleMove);
			}
		},

		viewDidLoad: function (this: VListViewInstance) {
			const vlOpts: ImperativeVirtualListOptions<VListItem> = {
				container: '#' + this.containerId,
				data: this.bigData,
				renderRow: this.renderRow.bind(this),
				elHeight: 220,
				bufferAmount: 5,
				visibleEls: 10,
			};

			this.vl = createImperativeVirtualList(vlOpts);
			this.vl.init();

			this.boundHandleMove = this.handleMove.bind(this);
			navigationService
				.getBus()
				.on(NavigationEvents.MOVE, this.boundHandleMove);
		},

		/**
		 * @param event
		 */
		handleMove: function (this: VListViewInstance, event: MoveEventPayload) {
			if (
				this.vl &&
				event.detail &&
				event.detail.nextContainer &&
				event.detail.nextContainer.id === this.containerId
			) {
				const direction = event.detail.direction;
				const position = parseDecimal(
					event.detail.nextElement.dataset.vlIndex || '0'
				);

				this.vl.updateList(direction, position);
			}
		},

		/**
		 * @param bd
		 */
		renderRow: function (bd: VListItem) {
			const indexOf = this.bigData.indexOf(bd);

			return a(
				{
					className: s.data,
					dataset: { vlIndex: indexOf },
				},
				div(
					{},
					p({}, 'Decimal: ' + bd.d),
					p({}, 'Binary: ' + bd.b),
					p({}, 'Hex: ' + bd.h)
				)
			);
		},

		render: function (this: VListViewInstance) {
			return div(
				{ className: 'view', id: this.id },
				VirtualList({ id: 'my-vlist', className: 'my-vlist' })
			);
		},
	});

	return vListView;
}
