import type { BaseViewInstance, ViewOptions } from 'crt';
import type { IDrm } from './drm';

import { createBaseView, Orientation } from 'crt';

import { div, a } from '../../html';

import { Carousel } from '../../components/Carousel';
import { Heading } from '../../components/Heading';

import { Codec } from './Codec';
import { DrmType } from './DrmType';
import { getDrm } from './drm';
import { VideoTypes } from './VideoTypes';
import { Codecs } from './Codecs';
import { isCodecSupported } from './isCodecSupported';

import s from './canivideo.scss';

export type ContainerType =
	| 'video/mp4'
	| 'video/webm'
	| 'application/vnd.apple.mpegurl';

type DrmSupport = {
	drm: Promise<IDrm | void | undefined> | IDrm | void | undefined;
};

export interface CodecSupportInfo {
	title: string;
	type: string;
	mse: boolean;
	video: boolean;
	[DrmType.WIDEVINE]: DrmSupport;
	[DrmType.PLAYREADY]: DrmSupport;
	[DrmType.PLAYREADY_LEGACY]: DrmSupport;
	[DrmType.FAIRPLAY]: DrmSupport;
}

export type VideoTypeSupport = Record<string, CodecSupportInfo>;

export type CanIViewInstance = BaseViewInstance & {
	data: Record<string, VideoTypeSupport>;
	getData: (this: CanIViewInstance) => void;
	updateRender: (this: CanIViewInstance, targetEl: HTMLElement) => void;
};

/**
 * @param options
 */
export function createCanivideoView(options: ViewOptions): CanIViewInstance {
	const base = createBaseView(options);

	const canivideoView = {
		...base,
		data: {},

		getData: function (this: CanIViewInstance) {
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
						WIDEVINE: { drm: undefined },
						PLAYREADY: { drm: undefined },
						PLAYREADY_LEGACY: { drm: undefined },
						FAIRPLAY: { drm: undefined },
					};

					this.data[type][typeAndCodec][DrmType.WIDEVINE].drm = getDrm(
						DrmType.WIDEVINE,
						typeAndCodec
					).then(
						(res) => (this.data[type][typeAndCodec][DrmType.WIDEVINE].drm = res)
					);

					this.data[type][typeAndCodec][DrmType.PLAYREADY].drm = getDrm(
						DrmType.PLAYREADY,
						typeAndCodec
					).then(
						(res) =>
							(this.data[type][typeAndCodec][DrmType.PLAYREADY].drm = res)
					);

					this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm = getDrm(
						DrmType.PLAYREADY_LEGACY,
						typeAndCodec
					).then(
						(res) =>
							(this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm =
								res)
					);

					this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm = getDrm(
						DrmType.FAIRPLAY,
						typeAndCodec
					).then(
						(res) => (this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm = res)
					);

					Promise.allSettled([
						this.data[type][typeAndCodec][DrmType.WIDEVINE].drm,
						this.data[type][typeAndCodec][DrmType.PLAYREADY].drm,
						this.data[type][typeAndCodec][DrmType.PLAYREADY_LEGACY].drm,
						this.data[type][typeAndCodec][DrmType.FAIRPLAY].drm,
					]).then(() => {
						const el = document.querySelector('#codecs-carousel > div');
						if (el instanceof HTMLElement) {
							this.updateRender(el);
						}
					});
				});
			});
		},

		/**
		 * @param targetEl
		 */
		updateRender: function (this: CanIViewInstance, targetEl: HTMLElement) {
			const target = targetEl || document.getElementById(this.id);

			if (target && this.data) {
				target.innerHTML = '';
				Object.keys(this.data).forEach((type: string) => {
					// Explicitly type 'type' as string
					const videoTypeEl = div({
						props: { className: s['type-wrapper'] },
						children: [
							div({ props: { className: s.title }, children: type }),
							...Object.keys(this.data[type]).map((codec) => {
								return a({
									props: { href: '#', className: s.codec },
									children: [
										Codec({
											props: {
												data: this.data[type][codec],
												codec,
												type,
												title: this.data[type][codec].title,
											},
										}),
									],
								});
							}),
						],
					});

					target.appendChild(videoTypeEl);
				});
			}
		},

		render: function () {
			return div({
				props: { className: 'view', id: this.id },
				children: [
					Heading({ props: { level: 1 }, children: 'CAN I VIDEO?' }),
					Carousel({
						props: {
							id: 'codecs-carousel',
							orientation: Orientation.VERTICAL,
							blockExit: 'right up down',
							childQuery: `.${s.codec}`,
							scrollStartQuery: `.${s.codec}`,
						},
						children: [],
					}),
				],
			});
		},
	};

	canivideoView.getData();

	return canivideoView;
}
