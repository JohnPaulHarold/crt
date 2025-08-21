import { createSignaller } from 'crt';

/**
 * @typedef {object} FakePlayerOptions
 * @property {number} [duration=100] - The total duration of the fake media.
 */

/**
 * Creates a fake player instance that simulates video playback.
 * @param {FakePlayerOptions} [options={}]
 * @returns {{
 *  state: {
 *      isPlaying: import('crt').SignallerInstance,
 *      isMuted: import('crt').SignallerInstance,
 *      currentTime: import('crt').SignallerInstance,
 *      duration: number
 *  },
 *  controls: {
 *      togglePlay: () => void,
 *      toggleMute: () => void
 *  },
 *  destroy: () => void
 * }}
 */
export function createFakePlayer(options = {}) {
	const duration = options.duration || 100;

	const state = {
		isPlaying: createSignaller(false),
		isMuted: createSignaller(false),
		currentTime: createSignaller(0),
		duration: duration,
	};

	const intervalId = window.setInterval(() => {
		if (state.isPlaying.getValue()) {
			const newTime = (state.currentTime.getValue() + 1) % (duration + 1);
			state.currentTime.setValue(newTime);
		}
	}, 1000);

	const controls = {
		togglePlay: () => {
			state.isPlaying.setValue(!state.isPlaying.getValue());
		},
		toggleMute: () => {
			state.isMuted.setValue(!state.isMuted.getValue());
		},
	};

	const destroy = () => {
		window.clearInterval(intervalId);
		// Reset state for a clean slate
		state.isPlaying.setValue(false);
		state.currentTime.setValue(0);
		state.isMuted.setValue(false);
	};

	return { state, controls, destroy };
}
