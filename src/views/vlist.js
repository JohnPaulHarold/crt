/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */

import { Carousel } from '../components/Carousel';
import { BaseView } from '../libs/baseView';
import { a, div, p } from '../libs/makeElement';
import { Orientation } from '../models/Orientation';

import s from './vlist.css';

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
 * @extends BaseView
 */
export class VList extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

        this.bigData = buildBigData(600);
    }

    viewDidLoad() {
      console.log(`[${this.id}][viewDidLoad]`, this.bigData);
    }

    render() {
        return div(
            { className: 'view', id: this.id },

            Carousel(
              {
                  id: 'data-carousel',
                  orientation: Orientation.VERTICAL,
                  blockExit: 'right up down',
                  startOffset: 3
              },
              this.bigData.map((bd) => {
                return a({ className: s.data}, 
                  div({}, 
                    p({}, "Decimal: " + bd.d),
                    p({}, "Binary: " + bd.b),
                    p({}, "Hex: " + bd.h)
                  ))
              })
          )
        );
    }
}
