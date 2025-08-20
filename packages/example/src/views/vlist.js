import {
    createBaseView,
    Direction,
    getBaseFontSize,
    removeElement,
    parseDecimal,
    transformProp,
    pxToRem,
} from 'crt';

import { a, div, p, section } from '../h.js';

import { NavigationEvents, navigationBus } from '../navigation.js';

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
 * @typedef {object} VLOptions
 * @property {VListItem[]} data
 * @property {string} options.container expects a queryString
 * @property {(item: VListItem) => HTMLElement} options.renderRow
 * @property {number} options.elHeight
 * @property {number} [options.bufferAmount]
 * @property {number} [options.visibleEls]
 */

/**
 * @typedef {object} VLInstance
 * @property {VListItem[]} data
 * @property {number} visibleEls
 * @property {number} bufferAmount
 * @property {string} container
 * @property {HTMLElement | null} containerEl
 * @property {(item: VListItem) => HTMLElement} renderRow
 * @property {HTMLElement} sliderEl
 * @property {number} elHeight
 * @property {number} paddingTop
 * @property {number[]} window
 * @property {() => void} init
 * @property {(start: number, end: number) => VListItem[]} getNextData
 * @property {(direction: Direction, position: number) => void} updateList
 */

/**
 * @param {VLOptions} options
 * @returns {VLInstance}
 */
function createVL(options) {
    /** @type {VLInstance} */
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
         * @this {VLInstance}
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
         * @this {VLInstance}
         */
        getNextData(start, end) {
            return this.data.slice(start, end);
        },

        /**
         * @this {VLInstance}
         */
        updateList(direction, position) {
            const lowerBound = this.window[0];
            const upperBound = this.window[1];

            // @ts-ignore
            this.sliderEl.style[transformProp] =
                'translateY(' + -(position * this.elHeight) + 'rem)';

            if (
                direction === Direction.DOWN &&
                position >= upperBound - this.bufferAmount
            ) {
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

            if (
                direction === Direction.DOWN &&
                position > lowerBound + this.visibleEls + this.bufferAmount
            ) {
                let i = this.visibleEls - 1;
                while (i >= 0) {
                    const el = this.sliderEl.children[i];
                    removeElement(el);
                    i--;
                }

                this.paddingTop =
                    this.paddingTop + this.visibleEls * this.elHeight;
                this.sliderEl.style.paddingTop = this.paddingTop + 'rem';
                this.window[0] = this.window[0] + this.visibleEls;
            }

            if (
                direction === Direction.UP &&
                position <= lowerBound + this.bufferAmount
            ) {
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

                this.paddingTop =
                    this.paddingTop - slice.length * this.elHeight;
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
 *  vl: VLInstance | null,
 *  boundHandleMove: ((event: any) => void) | null,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  handleMove: (event: any) => void,
 *  renderRow: (bd: VListItem) => HTMLElement,
 *  render: () => HTMLElement
 * }} VListViewInstance
 */

/**
 * @param {import('crt').ViewOptions} options
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
                navigationBus.off(NavigationEvents.MOVE, this.boundHandleMove);
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

            this.vl = createVL(vlOpts);
            this.vl.init();

            this.boundHandleMove = this.handleMove.bind(this);
            navigationBus.on(NavigationEvents.MOVE, this.boundHandleMove);
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
