import {
    createBaseView,
    Direction,
    Orientation,
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
 * 
 * @param {*} props 
 */
function VirtualList(props) {
  return section({
    className: 'virtual-list' + ' ' + props.className,
    id: props.id
  });
}

/**
 * 
 * @param {number} dec 
 * @returns 
 */
function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

/**
 * 
 * @param {number} dec 
 * @returns 
 */
function dec2hex(dec) {
  return (dec >>> 0).toString(16);
}

/**
 * 
 * @param {number} bigNumber 
 * @returns 
 */
function buildBigData(bigNumber) {
  const bigData = [];

  for (let i = 0; i < bigNumber; i++) {
    bigData.push({
      d: i,
      b: dec2bin(i),
      h: dec2hex(i)
    })
  }

  return bigData
}

/**
 * 
 * @param {Object} options 
 * @param {*[]} options.data
 * @param {Orientation} [options.orientation]
 * @param {string} options.container expects a queryString
 * @param {function} options.renderRow
 * @param {number} options.elHeight
 * @param {number} [options.elWidth]
 * @param {number} [options.bufferAmount]
 * @param {number} [options.visibleEls]
 * @returns {object}
 */
function createVL(options) {
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
                this.window[0] = Math.max(
                    this.window[0] - this.visibleEls,
                    0
                );
            }
        },
    };

    vl.sliderEl.style.transition = 'transform 250ms ease';
    const baseFontSize = getBaseFontSize();
    vl.elHeight = pxToRem(options.elHeight, baseFontSize);

    return vl;
}

/**
 * @param {import('crt/types').ViewOptions} options
 * @returns {import('crt/types').BaseViewInstance}
 */
export function createVListView(options) {
    const base = createBaseView(options);

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
            this.vl.init();
            this.boundHandleMove = this.handleMove.bind(this);
            navigationBus.on(NavigationEvents.MOVE, this.boundHandleMove);
        },

        handleMove: function (event) {
            if (
                event.detail &&
                event.detail.nextContainer.id === this.containerId
            ) {
                const direction = event.detail.direction;
                const position = parseDecimal(
                    event.detail.nextElement.dataset.vlIndex
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

    const vlOpts = {
        container: '#' + vListView.containerId,
        data: vListView.bigData,
        renderRow: vListView.renderRow.bind(vListView),
        elHeight: 220,
        bufferAmount: 5,
        visibleEls: 10,
    };

    vListView.vl = createVL(vlOpts);

    return vListView;
}