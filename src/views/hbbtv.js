/**
 * @typedef {import('../declarations/types').NavViewOptions} NavViewOptions
 */

import { div } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';

/**
 * @extends BaseView
 */
export class Hbbtv extends BaseView {
    /**
     * @param {NavViewOptions} options
     */
    constructor(options) {
        super(options);
    }

    render() {
        return div({ className: 'hbbtv', id: this.id }, 'HbbTV');
    }
}
