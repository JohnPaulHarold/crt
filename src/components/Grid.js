/**
 * @typedef {import('../declarations/types').GridProps} GridProps
 */

import { a, div } from "../libs/makeElement";
import { Tile } from "./Tile";

/**
 * 
 * @param {GridProps} props 
 * @returns {Element}
 */
export const Grid = (props) => {
  const id = "episde123";

  return (
    div(
      { className: 'grid' }, "Grid",
      a(
        { href: "#/episode/S123", id },
        Tile({ id, title: "S123" })
      )
    )
  )
}