/**
 * @file A service for handling text-to-speech announcements for accessibility.
 * This service is isomorphic, providing a functional implementation for the browser
 * and a no-op implementation for the server.
 */
import { loga } from 'crt';

const logr = loga.create('SpeechService');

export interface SpeechServiceInstance {
	speak: (text: string) => void;
	cancel: () => void;
}

// A "no-operation" function that does nothing.
const noop = () => {};

// Check for the browser environment and API support once.
const isSupported =
	typeof window !== 'undefined' &&
	window.speechSynthesis &&
	window.SpeechSynthesisUtterance;

/**
 * The browser-specific implementation that uses the Web Speech API.
 * @returns {SpeechServiceInstance} The browser-specific service instance.
 */
function createBrowserService(): SpeechServiceInstance {
	const synthesis = window.speechSynthesis;
	const Utterance = window.SpeechSynthesisUtterance;

	return {
		speak(text) {
			if (!text) return;

			// Cancel any previously queued speech to prevent overlapping.
			synthesis.cancel();

			const utterance = new Utterance(text);
			synthesis.speak(utterance);
		},

		cancel() {
			synthesis.cancel();
		},
	};
}

/**
 * The server-side (or unsupported environment) implementation that does nothing.
 */
const dummyService: SpeechServiceInstance = {
	speak: noop,
	cancel: noop,
};

/**
 * The exported service instance. It will be the browser implementation if
 * the Web Speech API is available, otherwise it will be the dummy implementation.
 */
export const speechService: SpeechServiceInstance = isSupported
	? createBrowserService()
	: dummyService;

if (!isSupported) {
	logr.warn(
		'Web Speech API (SpeechSynthesis) is not supported in this environment.'
	);
}
