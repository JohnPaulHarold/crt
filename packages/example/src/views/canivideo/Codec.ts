import { cx } from 'crt';

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

const classNames = (list: string[], valid?: boolean): { className: string; } => ({
	className: cx(
		list.map((elm) => s[elm]).join(' ') +
			(valid ? ' ' + s[getValidClass(valid)] : '')
	),
});

const find = (list: SecurityLevel[], item: string): SecurityLevel | undefined => {
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

export const Codec = ({ data, codec, title }: CodecProps): Element => {
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

	const widevineL1 = isDrmReady(widevineDrm) ? find(widevineDrm.securityLevels, DrmLevels.L1) : undefined;
	const widevineL2 = isDrmReady(widevineDrm) ? find(widevineDrm.securityLevels, DrmLevels.L2) : undefined;
	const widevineL3 = isDrmReady(widevineDrm) ? find(widevineDrm.securityLevels, DrmLevels.L3) : undefined;
	const playreadySL150 = isDrmReady(playreadyDrm) ? find(playreadyDrm.securityLevels, DrmLevels.SL150) : undefined;
	const playreadySL2000 = isDrmReady(playreadyDrm) ? find(playreadyDrm.securityLevels, DrmLevels.SL2000) : undefined;
	const playreadySL3000 = isDrmReady(playreadyDrm) ? find(playreadyDrm.securityLevels, DrmLevels.SL3000) : undefined;

	return div(
		classNames(['codec-wrapper']),
		div(
			classNames(['title-wrapper', 'box'], isCodecValid),
			div(classNames(['title']), title),
			div(codec)
		),
		div(
			classNames(['half']),
			div(
				classNames(['text-center', 'inline-block', 'box'], !!data.mse),
				'MSE'
			),
			div(
				classNames(['text-center', 'inline-block', 'box'], !!data.video),
				'<video />'
			)
		),
		div(
			classNames(['text-center', 'whole']),
			div(classNames(['title-wrapper', 'box'], isDrmValid), 'DRM')
		),
		div(
			{ className: s.quarter },
			div(
				{ className: s['inline-block'] },
				div(
					classNames(['text-center', 'box'], isDrmReady(widevineDrm) && widevineDrm.supported),
					DrmNames[DrmType.WIDEVINE]
				),
				div(
					{ className: s.third },
					div(
						classNames(
							['text-center', 'inline-block', 'box'],
							widevineL1 && widevineL1.supported
						),
						DrmLevels.L1
					),
					div(
						classNames(
							['text-center', 'inline-block', 'box'],
							widevineL2 && widevineL2.supported
						),
						DrmLevels.L2
					),
					div(
						classNames(
							['text-center', 'inline-block', 'box'],
							widevineL3 && widevineL3.supported
						),
						DrmLevels.L3
					)
				)
			),
			div(
				{ className: s['inline-block'] },
				div(
					classNames(['text-center', 'box'], isDrmReady(playreadyDrm) && playreadyDrm.supported),
					DrmNames[DrmType.PLAYREADY]
				),
				div(
					{ className: s.third },
					div(
						classNames(
							['text-center', 'inline-block', 'box'],
							playreadySL150 && playreadySL150.supported
						),
						DrmLevels.SL150
					),
					div(
						classNames(
							['text-center', 'inline-block', 'box'],
							playreadySL2000 && playreadySL2000.supported
						),
						DrmLevels.SL2000
					),
					div(
						classNames(
							['text-center', 'inline-block', 'box'],
							playreadySL3000 && playreadySL3000.supported
						),
						DrmLevels.SL3000
					)
				)
			),
			div(
				classNames(['v-align-top', 'inline-block', 'b-bottom']),
				div(
					classNames(['text-center', 'box'], isDrmReady(playreadyLegacyDrm) && playreadyLegacyDrm.supported),
					DrmNames[DrmType.PLAYREADY_LEGACY]
				)
			),
			div(
				classNames(['v-align-top', 'inline-block', 'b-bottom']),
				div(
					classNames(['text-center', 'box'], isDrmReady(fairplayDrm) && fairplayDrm.supported),
					DrmNames[DrmType.FAIRPLAY]
				)
			)
		)
	);
};
