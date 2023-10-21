/**
 * @typedef {import('../../declarations/types').ContainerType} ContainerType
 * @typedef {import('../../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../../declarations/types').Codec} Codec
 */
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

import s from './canivideo.css';

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
     *
     * @param {HTMLElement} targetEl
     */
    updateRender(targetEl) {
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

    render() {
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
}
