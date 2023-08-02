/**
 * @typedef {import('../declarations/types').NavViewOptions} NavViewOptions
 */

import { div } from "../libs/makeElement";
import { BaseView } from "../libs/baseView";

/**
 * @extends BaseView
 */
export class Nav extends BaseView {
  /**
   * @param {NavViewOptions} options
   */
  constructor(options) {
    super(options);
  }

  render() {
    return (
      div(
        { className: 'nav', id: this.id },
        "Nav"
      )
    )
  }
}