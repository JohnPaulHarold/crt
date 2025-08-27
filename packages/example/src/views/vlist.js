import { createBaseView, Direction } from 'crt';

import { a, div, p, section } from '../html.js';
import { createImperativeVirtualList } from '../libs/imperativeVirtualList.js';

import {
	NavigationEvents,
	navigationService,
} from '../services/navigationService.js';
import { parseDecimal } from '../utils/math/parseDecimal.js';

import s from './vlist.scss';

/**
 * @param {{id: string, className: string}} props
 */
function VirtualList(props) {
	return section({
		className: 'virtual-list' + ' ' + props.className,
		id: props.id,
	});
}

/**
 * @typedef {object} VListItem
 * @property {number} d Decimal
 * @property {string} b Binary
 * @property {string} h Hex
 */

/**
 * @param {number} dec
 * @returns {string}
 */
function dec2bin(dec) {
	return (dec >>> 0).toString(2);
}

/**
 * @param {number} dec
 * @returns {string}
 */
function dec2hex(dec) {
	return (dec >>> 0).toString(16);
}

/**
 * @param {number} bigNumber
 * @returns {VListItem[]}
 */
function buildBigData(bigNumber) {
	/** @type {VListItem[]} */
	const bigData = [];

	for (let i = 0; i < bigNumber; i++) {
		bigData.push({
			d: i,
			b: dec2bin(i),
			h: dec2hex(i),
		});
	}

	return bigData;
}

/**
 * @typedef {object} MoveEventPayloadDetail
 * @property {Direction} direction
 * @property {HTMLElement} lastElement
 * @property {HTMLElement} nextElement
 * @property {HTMLElement} lastContainer
 * @property {HTMLElement} nextContainer
 */

/**
 * @typedef {object} MoveEventPayload
 * @property {string} type
 * @property {MoveEventPayloadDetail} detail
 */

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  bigData: VListItem[],
 *  containerId: string,
 *  vl: import('../libs/imperativeVirtualList.js').ImperativeVirtualListInstance<VListItem> | null,
 *  boundHandleMove: ((event: any) => void) | null,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  handleMove: (event: any) => void,
 *  renderRow: (bd: VListItem) => HTMLElement,
 *  render: () => HTMLElement
 * }} VListViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {VListViewInstance}
 */
export function createVListView(options) {
	const base = createBaseView(options);

	/** @type {VListViewInstance} */
	const vListView = {
		...base,
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

		viewDidLoad: function () {
			const vlOpts = {
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

		handleMove: function (event) {
			/** @type {MoveEventPayload} */
			const moveEvent = event;

			if (
				this.vl &&
				moveEvent.detail &&
				moveEvent.detail.nextContainer &&
				moveEvent.detail.nextContainer.id === this.containerId
			) {
				const direction = moveEvent.detail.direction;
				const position = parseDecimal(
					moveEvent.detail.nextElement.dataset.vlIndex || '0'
				);

				this.vl.updateList(direction, position);
			}
		},

		renderRow: function (bd) {
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

		render: function () {
			return div(
				{ className: 'view', id: this.id },
				VirtualList({ id: 'my-vlist', className: 'my-vlist' })
			);
		},
	};

	return vListView;
}
