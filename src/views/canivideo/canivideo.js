import { Carousel } from '../../components/Carousel';
import { Codec } from './Codec';
import { Heading } from '../../components/Heading';

import { Codecs } from '../../models/Codecs';
import { DrmType } from '../../models/DrmType';
import { Orientation } from '../../models/Orientation';
import { VideoTypes } from '../../models/VideoTypes';

import { BaseView } from '../../libs/baseView';
import { a, div } from '../../libs/makeElement';

import { getDrm } from '../../utils/drm';
import { isCodecSupported } from '../../utils/isCodecSupported';

import s from './canivideo.scss';

/**
 * @typedef {'video/mp4' | 'video/webm' | 'application/vnd.apple.mpegurl'} ContainerType
 */

/**
 * @typedef {object} Codec
 * @property {string} title
 * @property {string} contentType
 */

/**
 * @extends BaseView
 * @typedef {BaseView & Canivideo} CanivideoView
 */

/**
 * @constructor
 * @param {import('../../libs/baseView').ViewOptions} options
 * @this CanivideoView
 */
export function Canivideo(options) {
    BaseView.call(this, options);
    /** @type {Record<string, any>} type */
    this.data = {};
    this.getData();
  }
  
// inherit from BaseView
Canivideo.prototype = Object.create(BaseView.prototype);
// Set the constructor back
Canivideo.prototype.constructor = Canivideo;

/**
 * @this {CanivideoView}
 */
Canivideo.prototype.getData = function () {
    VideoTypes.forEach((type) => {
        this.data[type] = {};
        Codecs.forEach((codec) => {
            const typeAndCodec = type + codec.contentType;
            const { mse, video } = isCodecSupported(typeAndCodec);
            this.data[type][typeAndCodec] = {
                title: codec.title,
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
            ).then(
                (res) =>
                    (this.data[type][typeAndCodec][DrmType.WIDEVINE].drm =
                        res)
            );

            this.data[type][typeAndCodec][DrmType.PLAYREADY].drm = getDrm(
                DrmType.PLAYREADY,
                typeAndCodec
            ).then(
                (res) =>
                    (this.data[type][typeAndCodec][DrmType.PLAYREADY].drm =
                        res)
            );

            this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm =
                getDrm(DrmType.PLAYREADY_LEGACY, typeAndCodec).then(
                    (res) =>
                        (this.data[type][typeAndCodec][
                            DrmType.PLAYREADY_LEGACY
                        ].drm = res)
                );

            this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm = getDrm(
                DrmType.FAIRPLAY,
                typeAndCodec
            ).then(
                (res) =>
                    (this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm =
                        res)
            );

            Promise.allSettled([
                this.data[type][typeAndCodec][DrmType.WIDEVINE].drm,
                this.data[type][typeAndCodec][DrmType.PLAYREADY].drm,
                this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm,
                this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm,
            ]).then(() => {
                const el = document.querySelector('#codecs-carousel > div');
                el instanceof HTMLElement && this.updateRender(el);
            });
        });
    });
}

/**
 * @this {CanivideoView}
 * @param {HTMLElement} targetEl
 */
Canivideo.prototype.updateRender = function (targetEl) {
    let target = targetEl || document.getElementById(this.id);

    if (target && this.data) {
        target.innerHTML = '';
        Object.keys(this.data).forEach((type) => {
            const videoTypeEl = div(
                { className: s['type-wrapper'] },
                div({ className: s.title }, type),
                Object.keys(this.data[type]).map((codec) => {
                    return a({ href: '#', className: s.codec }, [
                        Codec({
                            data: this.data[type][codec],
                            codec,
                            type,
                            title: this.data[type][codec].title,
                        }),
                    ]);
                })
            );

            target && target.appendChild(videoTypeEl);
        });
    }
}

/**
 * @this {CanivideoView}
 * @returns {HTMLElement}
 */
Canivideo.prototype.render = function () {
    return div(
        { className: 'view', id: this.id },
        Heading({ level: 'h1' }, 'CAN I VIDEO?'),
        Carousel(
            {
                id: 'codecs-carousel',
                orientation: Orientation.VERTICAL,
                blockExit: 'right up down',
                childQuery: `.${s.codec}`,
                scrollStartQuery: `.${s.codec}`,
            },
            []
        )
    );
}
