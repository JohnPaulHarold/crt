import { createBaseView, watch, diff, noop, loga } from 'crt';
import { div, button, p } from '../html.js';
import {
	navigationService,
	NavigationEvents,
} from '../services/navigationService.js';
import { createFakePlayer } from '../libs/createFakePlayer.js';
import s from './player.scss';

const logr = loga.create('player');

// 1. Create an instance of our fake player. This encapsulates all state and logic.
const player = createFakePlayer({ duration: 120 });

/**
 * A "template" function that returns a VDOM tree based on the current state.
 * @returns {HTMLElement}
 * @this {PlayerViewInstance}
 */
function getTemplate() {
	// Read all state values from the player's signals
	const isPlaying = player.state.isPlaying.getValue();
	const isMuted = player.state.isMuted.getValue();
	const currentTime = player.state.currentTime.getValue();
	const progress = (currentTime / player.state.duration) * 100;

	return /** @type {HTMLElement} */ (
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

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  stopWatching: () => void,
 *  boundFocusHandler: (() => void) | null,
 * }} PlayerViewInstance
 */

/**
 * @param {import('crt').ViewOptions} options
 * @returns {PlayerViewInstance}
 */
export function createPlayerView(options) {
	const base = createBaseView(
		Object.assign({}, options, { preserveAttributes: ['data-focus'] })
	);

	/** @type {PlayerViewInstance} */
	const playerView = Object.assign({}, base, {
		stopWatching: noop,
		boundFocusHandler: null,

		/** @this {PlayerViewInstance} */
		viewDidLoad: function () {
			if (this.viewEl) {
				const self = this;

				// This handler will be called when any of the watched signals change.
				const handler = () => {
					if (self.viewEl) {
						const newVdom = getTemplate.call(self);
						diff(newVdom, self.viewEl, {
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

		/** @this {PlayerViewInstance} */
		render: function () {
			return getTemplate.call(this);
		},
	});

	return playerView;
}
