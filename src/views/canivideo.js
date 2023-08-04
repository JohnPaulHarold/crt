/**
 * @typedef {import('../declarations/types').ContainerType} ContainerType
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').Codec} Codec
 */
import { Carousel } from "../components/Carousel";
import { Codec } from "../components/Codec";
import { Codecs } from "../enums/Codecs";
import { DrmType } from "../enums/DrmType";
import { Orientation } from "../enums/Orientation";
import { VideoTypes } from "../enums/VideoTypes";
import { BaseView } from "../libs/baseView";
import { a, div, h1, h2, section } from "../libs/makeElement";
import { getDrm } from "../utils/drm";
import { isCodecSupported } from "../utils/isCodecSupported";

import s from "./canivideo.css";

/**
 * @extends BaseView
 */
export class Canivideo extends BaseView {
  /**
   * @param {ViewOptions} options
   */
  constructor(options) {
    super(options);
    /** @type {Record<string, any>} type */
    this.data = {};
    this.getData();
  }

  getData() {
    VideoTypes.forEach((type) => {
      this.data[type] = {};
      Codecs.forEach((codec) => {
        const typeAndCodec = type + codec.contentType;
        const { mse, video } = isCodecSupported(typeAndCodec);
        this.data[type][typeAndCodec] = {
          type,
          mse,
          video,
          [DrmType.WIDEVINE]: {},
          [DrmType.PLAYREADY]: {},
          [DrmType.PLAYREADY_LEGACY]: {},
          [DrmType.FAIRPLAY]: {},
        };

        this.data[type][typeAndCodec][DrmType.WIDEVINE].drm = getDrm(
          DrmType.WIDEVINE,
          typeAndCodec
        )?.then(
          (res) => (this.data[type][typeAndCodec][DrmType.WIDEVINE].drm = res)
        );

        this.data[type][typeAndCodec][DrmType.PLAYREADY].drm = getDrm(
          DrmType.PLAYREADY,
          typeAndCodec
        )?.then(
          (res) => (this.data[type][typeAndCodec][DrmType.PLAYREADY].drm = res)
        );

        this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm = getDrm(
          DrmType.PLAYREADY_LEGACY,
          typeAndCodec
        )?.then(
          (res) =>
            (this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm = res)
        );

        this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm = getDrm(
          DrmType.FAIRPLAY,
          typeAndCodec
        )?.then(
          (res) => (this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm = res)
        );

        Promise.allSettled([
          this.data[type][typeAndCodec][DrmType.WIDEVINE].drm,
          this.data[type][typeAndCodec][DrmType.PLAYREADY].drm,
          this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm,
          this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm,
        ]).then((_) => {
          const el = document.querySelector("#codecs-carousel .slider");
          el instanceof HTMLElement && this.updateRender(el);
        });
      });
    });
  }

  /**
   *
   * @param {HTMLElement} targetEl
   */
  updateRender(targetEl) {
    let target = targetEl || document.getElementById(this.id);

    if (target && this.data) {
      target.innerHTML = "";
      target.appendChild(h1("CAN I VIDEO?"));
      Object.keys(this.data).forEach((type) => {
        target?.appendChild(h2(type));
        Object.keys(this.data[type]).forEach((codec) => {
          target?.appendChild(
            a({ href: "#", className: s.codec }, [
              Codec({ data: this.data[type][codec], codec, type }),
            ])
          );
        });
      });
    }
  }

  render() {
    return div(
      { className: "view", id: this.id },
      Carousel(
        {
          id: "codecs-carousel",
          orientation: Orientation.VERTICAL,
        },
        []
      )
    );
  }
}
