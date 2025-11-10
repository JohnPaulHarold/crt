import type { BaseViewInstance, DirectionType, ViewOptions } from 'crt';

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

	return (
		div(
			{ className: 'view ' + s.playerContainer, id: this.id },
			div({ className: s.player }, [
				div({ className: s.progress }, [
					div({
						className: s.progressBar,
						// Pass a style OBJECT, not a string, to fix the bug.
						style: { width: `${progress}%` },
					}),
				]),
				div({ className: s.controls }, [
					button(
						{
							id: 'play-pause-btn',
							onclick: player.controls.togglePlay,
						},
						isPlaying ? 'Pause' : 'Play'
					),
					button(
						{
							id: 'mute-btn',
							onclick: player.controls.toggleMute,
						},
						isMuted ? 'Unmute' : 'Mute'
					),
				]),
				// A "subtitles" display that automatically updates
				p(
					{ className: s.subtitles },
					`Time: ${currentTime}s. ${isMuted ? 'MUTED' : ''}`
				),
			])
		)
	);
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
