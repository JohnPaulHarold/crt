import { type SignalerInstance, createSignaler } from 'crt';

export interface FakePlayerOptions {
	duration?: number;
}

interface FakePlayerReturnInterface {
	state: {
		isPlaying: SignalerInstance<boolean>;
		isMuted: SignalerInstance<boolean>;
		currentTime: SignalerInstance<number>;
		duration: number;
	};
	controls: {
		togglePlay: () => void;
		toggleMute: () => void;
	};
	destroy: () => void;
}

/**
 * Creates a fake player instance that simulates video playback.
 */
export function createFakePlayer(
	options: FakePlayerOptions = {}
): FakePlayerReturnInterface {
	const duration = options.duration || 100;

	const state = {
		isPlaying: createSignaler(false),
		isMuted: createSignaler(false),
		currentTime: createSignaler(0),
		duration: duration,
	};

	const intervalId = setInterval(() => {
		if (state.isPlaying.getValue()) {
			// With a generic Signaller, getValue() is now type-safe and returns a number.
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
