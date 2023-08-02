/**
 * @typedef {import('../declarations/types').SpinnerProps} SpinnerProps
 */

import { div, span } from "../libs/makeElement"

import s from './Spinner.css';
/**
 * @param {SpinnerProps=} props
 * @returns {HTMLElement}
 */
export const Spinner = (props) => {
  return (
    div(
      { className: s.spinnerContainer },
      div(
        { className: s.spinnerInner },
        span(props && props.message ? props.message : "Loading...")
      )
    )
  )
}
