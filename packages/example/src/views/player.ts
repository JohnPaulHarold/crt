import type { BaseViewInstance, ViewOptions } from 'crt';

import { createBaseView, watch, diff, noop, loga } from 'crt';
import { div, button, p } from '../html.js';
import { createFakePlayer } from '../libs/createFakePlayer.js';

import s from './player.scss';

const logr = loga.create('player');

// 1. Create an instance of our fake player. This encapsulates all state and logic.
const player = createFakePlayer({ duration: 120 });

/**
 * A "template" function that returns a VDOM tree based on the current state.
 */
function getTemplate(this: PlayerViewInstance): HTMLElement {
	// Read all state values from the player's signals
	const isPlaying = player.state.isPlaying.getValue();
	const isMuted = player.state.isMuted.getValue();
	const currentTime = player.state.currentTime.getValue();
	const progress = (currentTime / player.state.duration) * 100;

	return div({
		props: { className: 'view ' + s.playerContainer, id: this.id },
		children: div({
			props: { className: s.player },
			children: [
				div({
					props: { className: s.progress },
					children: [
						div({
							props: {
								className: s.progressBar,
								style: { width: `${progress}%` },
							},
						}),
					],
				}),
				div({
					props: { className: s.controls },
					children: [
						button({
							props: {
								id: 'play-pause-btn',
								onclick: player.controls.togglePlay,
							},
							children: isPlaying ? 'Pause' : 'Play',
						}),
						button({
							props: {
								id: 'mute-btn',
								onclick: player.controls.toggleMute,
							},
							children: isMuted ? 'Unmute' : 'Mute',
						}),
					],
				}),
				p({
					props: { className: s.subtitles },
					children: `Time: ${currentTime}s. ${isMuted ? 'MUTED' : ''}`,
				}),
			],
		}),
	});
}

type PlayerViewInstance = BaseViewInstance & {
	stopWatching: () => void;
	boundFocusHandler: (() => void) | null;
};

/**
 * @param options
 */
export function createPlayerView(options: ViewOptions): PlayerViewInstance {
	const base = createBaseView(
		Object.assign({}, options, { preserveAttributes: ['data-focus'] })
	);

	const playerView: PlayerViewInstance = Object.assign({}, base, {
		stopWatching: noop,
		boundFocusHandler: null,

		viewDidLoad: function (this: PlayerViewInstance) {
			if (this.viewEl) {
				// This handler will be called when any of the watched signals change.
				const handler = () => {
					if (this.viewEl) {
						const newVdom = getTemplate.call(this);
						diff(newVdom, this.viewEl, {
							preserveAttributes: this.preserveAttributes,
						});
					}
				};

				this.stopWatching = watch(
					[
						player.state.isPlaying,
						player.state.isMuted,
						player.state.currentTime,
					],
					handler
				);
			}
		},

		destructor: function () {
			logr.info('Player view destructor called.');
			this.stopWatching();
			player.destroy();
		},

		render: function (this: PlayerViewInstance) {
			return getTemplate.call(this);
		},
	});

	return playerView;
}
