/**
 * @typedef {import('../declarations/enums/Orientation')} Orientation
*/

/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */

import { BaseView } from '../libs/baseView';
import { a, div, p, section } from '../libs/makeElement';
import { Direction } from '../models/Direction';
import { NavigationEvents, navigationBus } from '../navigation';
import { removeElement } from '../utils/dom/removeElement';
import { parseDecimal } from '../utils/math/parseDecimal';
import { transformProp } from '../utils/style/prefix';

import s from './vlist.css';

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

  for (let i= 0; i < bigNumber; i++) {
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
 * @param {number} [options.elHeight]
 * @param {number} [options.elWidth]
 * @param {number} [options.bufferAmount]
 * @param {number} [options.visibleEls]
 */
function VL(options) {
  this.data = options.data;
  this.visibleEls = options.visibleEls || 10;
  this.bufferAmount = options.bufferAmount || 5;
  this.container = options.container;
  this.containerEl = null;
  this.renderRow = options.renderRow;
  this.sliderEl = document.createElement('div');
  this.sliderEl.style.transition = "transform 250ms ease";
  this.elHeight = options.elHeight;
  /**
   * @type {number[]}
   */
  this.window = [];
}

VL.prototype = {
  init() {
    this.containerEl = document.querySelector(this.container);
    this.window = [0, this.visibleEls - 1];

    const slice = this.getNextData(0, this.visibleEls);

    slice.forEach((bd) => {
      const el = this.renderRow(bd);
      // apply the height, for now
      el.style.height = this.elHeight + "px";
      this.sliderEl.appendChild(el);
    });

    if (this.containerEl) {
      this.containerEl.appendChild(this.sliderEl)
    }
  },

  /**
   * 
   * @param {number} start 
   * @param {number} end 
   */
  getNextData(start, end) {
    return this.data.slice(start, end);
  },

  updateContainer() {

  },

  /**
   * @memberof VL
   * @param {Direction} direction 
   * @param {number} position 
   */
  updateList(direction, position) {
    // console.log('[VL][calculate]\n\ndirection %o\n\nposition %o', direction, position);
    // const normalisedPos = position % this.visibleEls;
    const lowerBound = this.window[0];
    const upperBound = this.window[1];

    // @ts-ignore
    this.sliderEl.style[transformProp] = 'translateY(' + -(position * this.elHeight) + 'px)';

    /**
     * @todo could not the prepent and append operations be combined?
     */


    if (position >= upperBound - this.bufferAmount && direction === Direction.DOWN) {
      console.log('[VL][calculate] append');
      // get a new page of data
      const frag = document.createDocumentFragment();
      const slice = this.getNextData(upperBound + 1, upperBound + 1 + this.visibleEls);
      slice.forEach((bd) => {
        const el = this.renderRow(bd);
        // apply the height, for now
        el.style.height = this.elHeight + "px";
        frag.appendChild(el);
      });
      this.sliderEl.appendChild(frag);
      this.window[1] = this.window[1] + this.visibleEls;
    }

    if (direction === Direction.DOWN && position > lowerBound + this.visibleEls + this.bufferAmount) {
      console.log('[VL][calculate] trim start');
      
      let i = this.visibleEls - 1;
      while (i >= 0) {
        const el = this.sliderEl.children[i];
        removeElement(el);
        i--;
      }

      this.sliderEl.style.paddingTop = (this.visibleEls * this.elHeight) + "px";
      this.window[0] = this.window[0] + this.visibleEls; 
    }

    if (position <= lowerBound + this.bufferAmount && direction === Direction.UP) {
      console.log('[VL][calculate] prepend', lowerBound);
      const frag = document.createDocumentFragment();
      const slice = this.getNextData(lowerBound - this.visibleEls, lowerBound);

      slice.forEach((bd) => {
        const el = this.renderRow(bd);
        // apply the height, for now
        el.style.height = this.elHeight + "px";
        frag.appendChild(el);
      });

      this.sliderEl.prepend(frag);
      this.sliderEl.style.paddingTop = (0 * this.elHeight) + "px";
      this.window[0] = 0; 
    }
  }
};

/**
 * @extends BaseView
 */
export class VList extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

        this.bigData = buildBigData(600);

        navigationBus.on(
          NavigationEvents.MOVE,
          this.handleMove.bind(this)
        )

        this.containerId = 'my-vlist'
        const vlOpts = {
          container: '#' + this.containerId,
          data: this.bigData,
          renderRow: this.renderRow.bind(this),
          /**
           * @todo elHeight will be resolution dependent
           */
          elHeight: 220,
          /**
           * @description number of rows that are buffered offscreen
           */
          bufferAmount: 5,
          visibleEls: 10,
        };

        this.vl = new VL(vlOpts);
    }

    destructor() {
      navigationBus.off(
        NavigationEvents.MOVE,
      )
    }

    viewDidLoad() {
      this.vl.init()
    }

    /**
     * 
     * @param {*} event 
     */
    handleMove(event) {
      if (event.detail && event.detail.nextContainer.id === this.containerId) {
        const direction = event.detail.direction;
        const position = parseDecimal(event.detail.nextElement.dataset.vlIndex);

        this.vl.updateList(direction, position);
      }
    }

    /**
     * 
     * @param {*} bd 
     * @returns 
     */
    renderRow(bd) {
      const indexOf = this.bigData.indexOf(bd);

      return a({
        className: s.data,
        dataset: { vlIndex: indexOf}
      }, 
        div({}, 
          p({}, "Decimal: " + bd.d),
          p({}, "Binary: " + bd.b),
          p({}, "Hex: " + bd.h)
        ))
    }

    render() {
        return div(
            { className: 'view', id: this.id },

            VirtualList({ id: 'my-vlist', className: 'my-vlist'})
        );
    }
}
