/**
 * @typedef {import('../declarations/types').KeyboardProps} KeyboardProps
 * @typedef {import('../declarations/types').KeyProps} KeyProps
 */

import { button, div } from "../libs/makeElement"

import s from './Keyboard.css';
/**
 * 
 * @param {KeyProps} props 
 * @returns {HTMLElement}
 */
const KeyButton = (props) => {
  return (
    button(
      {
        className: "keyboard-key " + s.keyboardKey + (typeof props.width === "number" ? ` ${s['w' + props.width]}` : ''),
        dataset: {
          keyValue: props.value
        }
      },
      props.display
    )
  )
}

/**
 * 
 * @param {KeyboardProps} props 
 * @returns {HTMLElement}
 */
export const Keyboard = (props) => {
  return (
    div(
      { className: s.keyboard },
      props.keyMap.map((row) => (
        div({ className: s.keyboardRow }, row.map((key) => (
          KeyButton(key)
        )))
      ))
    )
  )
}