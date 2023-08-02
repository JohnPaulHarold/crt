/**
 * @typedef {import('../declarations/types').NavProps} NavProps
 * @typedef {import("../declarations/types").NavItem} NavItem
 */

import { a, li, nav, ol } from "../libs/makeElement"
import { store } from "../state/pubsub";

import s from './Nav.css';

/**
 * 
 * @param {NavProps} props 
 * @returns 
 */
export const Nav = (props) => {
  let el = null;

  /**
   * 
   * @param {NavItem} param0 
   * @returns 
   */
  const buildNavItem = ({ id, title, href }) => {
    return li({}, a({ href, id }, title || href))
  }

  /**
   * 
   * @param {NavProps} _props 
   * @returns 
   */
  const render = (_props) => {
    return (
      nav(
        {
          id: 'main-nav',
          className: s.mainNav,
          dataset: {
            blockExit: _props.blockExit
          }
        },
        ol(undefined, _props.navItems.map(buildNavItem))
      )
    )
  }

  /**
   * @typedef {Object} Payload
   * @property {string} type
   * 
   * @param {Payload} payload
   */
  const listenToState = (payload) => {
    // todo: leave the wrappers alone if possible
    const el = document.querySelector('.nav-wrapper');
    if (payload.type === 'active' && el) {
      el.classList.remove('collapsed')
    } else if (payload.type === 'inactive' && el) {
      el.classList.add('collapsed')
    }
  }

  store.listen(props.id, listenToState)

  el = render(props)

  return el;
}