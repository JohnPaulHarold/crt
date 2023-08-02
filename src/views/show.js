/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */
import { div, h1, p } from "../libs/makeElement";
import { BaseView } from "../libs/baseView";
import { checkImages } from "../libs/indolence";

import { LazyImage } from "../components/LazyImage";

// import Logo from "";

import s from './show.css';

const showData = {
  id: 'TV1234567',
  title: "Ring 4",
  description: "Call me Ishmael. Some years ago--never mind how long precisely--having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off--then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.",
  rating: 'PG',
  related: {
    suggestions: [],

  }
}

/**
 * @extends BaseView
 */
export class Show extends BaseView {
  /**
   * @param {ViewOptions} options
   */
  constructor(options) {
    super(options);

    this.info = options.params;
    this.search = options.search;

    this.showName = this.search.name && typeof this.search.name === 'string'
      ? decodeURI(this.search.name) : '';

    this.bleedImage = LazyImage({
      className: s.showBleedImage,
      src: "https://picsum.photos/seed/" + decodeURI(this.showName).replace(' ', '') + "/1280/720"
    });
  }

  viewDidLoad() {
    const scope = document.getElementById(this.id);
    scope && checkImages(scope);
  }

  render() {
    return (
      div(
        { className: 'view', id: this.id },
        // full bleed image
        this.bleedImage,
        div({ className: s.showOverlay },
          h1({ className: s.showTitle }, "Show " + this.showName),
          LazyImage({ src: Logo, className: 'show-logo' }),
          p({}, "description")
        )
      )
    )
  }
}
