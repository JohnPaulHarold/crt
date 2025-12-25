import { cx } from 'crt-utils';

import type { CodecSupportInfo } from './canivideo';
import type { IDrm } from './drm';
import { div } from '../../html';

import { DrmNames } from './DrmNames';
import { DrmType } from './DrmType';
import { DrmLevels } from './DrmLevels';
import { getValidClass } from './getValidClass';

import s from './Codec.scss';

export interface SecurityLevel {
	name: string;
	supported: boolean;
}

export interface DRMSupportReport {
	supported: boolean;
	securityLevels: SecurityLevel[];
}

export interface CodecProps {
	data: CodecSupportInfo;
	codec: string;
	type: string;
	title: string;
}

const classNames = (
	list: string[],
	valid?: boolean
): { className: string } => ({
	className: cx(
		list.map((elm) => s[elm]).join(' ') +
			(valid ? ' ' + s[getValidClass(valid)] : '')
	),
});

const find = (
	list: SecurityLevel[],
	item: string
): SecurityLevel | undefined => {
	if (!list) return undefined;

	for (let i = 0; i < list.length; i++) {
		if (list[i].name == item) {
			return list[i];
		}
	}

	return undefined;
};

const isDrmReady = (drm: unknown): drm is IDrm =>
	!!drm && typeof (drm as IDrm).supported === 'boolean';

interface CodecOptions {
	props: CodecProps;
}

export const Codec = (options: CodecOptions): Element => {
	const { data, codec, title } = options.props;
	const widevineDrm = data.WIDEVINE.drm;
	const playreadyDrm = data.PLAYREADY.drm;
	const playreadyLegacyDrm = data.PLAYREADY_LEGACY.drm;
	const fairplayDrm = data.FAIRPLAY.drm;

	const isCodecValid = !!data.mse || !!data.video;
	const isDrmValid =
		(isDrmReady(widevineDrm) && widevineDrm.supported) ||
		(isDrmReady(playreadyDrm) && playreadyDrm.supported) ||
		(isDrmReady(playreadyLegacyDrm) && playreadyLegacyDrm.supported) ||
		(isDrmReady(fairplayDrm) && fairplayDrm.supported);

	const widevineL1 = isDrmReady(widevineDrm)
		? find(widevineDrm.securityLevels, DrmLevels.L1)
		: undefined; // Access data from options.props
	const widevineL2 = isDrmReady(widevineDrm)
		? find(widevineDrm.securityLevels, DrmLevels.L2)
		: undefined; // Access data from options.props
	const widevineL3 = isDrmReady(widevineDrm)
		? find(widevineDrm.securityLevels, DrmLevels.L3)
		: undefined; // Access data from options.props
	const playreadySL150 = isDrmReady(playreadyDrm)
		? find(playreadyDrm.securityLevels, DrmLevels.SL150)
		: undefined; // Access data from options.props
	const playreadySL2000 = isDrmReady(playreadyDrm)
		? find(playreadyDrm.securityLevels, DrmLevels.SL2000)
		: undefined; // Access data from options.props
	const playreadySL3000 = isDrmReady(playreadyDrm)
		? find(playreadyDrm.securityLevels, DrmLevels.SL3000)
		: undefined; // Access data from options.props

	return div({
		props: classNames(['codec-wrapper']),
		children: [
			div({
				props: classNames(['title-wrapper', 'box'], isCodecValid),
				children: [
					div({ props: classNames(['title']), children: title }),
					div({ children: codec }),
				],
			}),
			div({
				props: classNames(['half']),
				children: [
					div({
						props: classNames(
							['text-center', 'inline-block', 'box'],
							!!data.mse
						),
						children: 'MSE',
					}),
					div({
						props: classNames(
							['text-center', 'inline-block', 'box'],
							!!data.video
						),
						children: '<video />',
					}),
				],
			}),
			div({
				props: classNames(['text-center', 'whole']),
				children: [
					div({
						props: classNames(['title-wrapper', 'box'], isDrmValid),
						children: 'DRM',
					}),
				],
			}),
			div({
				props: { className: s.quarter },
				children: [
					div({
						props: { className: s['inline-block'] },
						children: [
							div({
								props: classNames(
									['text-center', 'box'],
									isDrmReady(widevineDrm) && widevineDrm.supported
								),
								children: DrmNames[DrmType.WIDEVINE],
							}),
							div({
								props: { className: s.third },
								children: [
									div({
										props: classNames(
											['text-center', 'inline-block', 'box'],
											widevineL1 && widevineL1.supported
										),
										children: DrmLevels.L1,
									}),
									div({
										props: classNames(
											['text-center', 'inline-block', 'box'],
											widevineL2 && widevineL2.supported
										),
										children: DrmLevels.L2,
									}),
									div({
										props: classNames(
											['text-center', 'inline-block', 'box'],
											widevineL3 && widevineL3.supported
										),
										children: DrmLevels.L3,
									}),
								],
							}),
						],
					}),
					div({
						props: { className: s['inline-block'] },
						children: [
							div({
								props: classNames(
									['text-center', 'box'],
									isDrmReady(playreadyDrm) && playreadyDrm.supported
								),
								children: DrmNames[DrmType.PLAYREADY],
							}),
							div({
								props: { className: s.third },
								children: [
									div({
										props: classNames(
											['text-center', 'inline-block', 'box'],
											playreadySL150 && playreadySL150.supported
										),
										children: DrmLevels.SL150,
									}),
									div({
										props: classNames(
											['text-center', 'inline-block', 'box'],
											playreadySL2000 && playreadySL2000.supported
										),
										children: DrmLevels.SL2000,
									}),
									div({
										props: classNames(
											['text-center', 'inline-block', 'box'],
											playreadySL3000 && playreadySL3000.supported
										),
										children: DrmLevels.SL3000,
									}),
								],
							}),
						],
					}),
					div({
						props: classNames(['v-align-top', 'inline-block', 'b-bottom']),
						children: div({
							props: classNames(
								['text-center', 'box'],
								isDrmReady(playreadyLegacyDrm) && playreadyLegacyDrm.supported
							),
							children: DrmNames[DrmType.PLAYREADY_LEGACY],
						}),
					}),
					div({
						props: classNames(['v-align-top', 'inline-block', 'b-bottom']),
						children: div({
							props: classNames(
								['text-center', 'box'],
								isDrmReady(fairplayDrm) && fairplayDrm.supported
							),
							children: DrmNames[DrmType.FAIRPLAY],
						}),
					}),
				],
			}),
		],
	});
};
