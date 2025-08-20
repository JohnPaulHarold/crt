import { loga } from 'crt';

const logr = loga.create('SpeechService');

/**
 * @typedef {object} SpeechServiceInstance
 * @property {(text: string) => void} speak - Speaks the provided text.
 * @property {(synth?: SpeechSynthesis, utteranceClass?: typeof SpeechSynthesisUtterance) => void} [_setDependenciesForTesting] - Injects dependencies for testing.
 * @property {() => void} cancel - Cancels any ongoing speech.
 */

/**
 * Creates a singleton service to manage text-to-speech functionality.
 * @returns {SpeechServiceInstance}
 */
function createSpeechService() {
    let synthesis = window.speechSynthesis;
    let Utterance = window.SpeechSynthesisUtterance;
    let isSupported = !!synthesis && !!Utterance;

    if (!isSupported) {
        logr.warn(
            'Web Speech API (SpeechSynthesis) is not supported in this browser.'
        );
    }

    /** @type {SpeechServiceInstance} */
    const service = {
        speak(text) {
            if (!isSupported || !text || !synthesis || !Utterance) {
                return;
            }

            // Cancel any previously queued speech to prevent overlapping.
            synthesis.cancel();

            const utterance = new Utterance(text);
            // You can configure voice, rate, pitch, etc. here if needed.
            // utterance.voice = ...
            // utterance.rate = 1.2;

            synthesis.speak(utterance);
        },

        cancel() {
            if (isSupported) {
                synthesis.cancel();
            }
        },

        _setDependenciesForTesting(newSynth, newUtteranceClass) {
            if (!newSynth || !newUtteranceClass) {
                return;
            }

            synthesis = newSynth;
            Utterance = newUtteranceClass;
            isSupported = !!synthesis && !!Utterance;
        },
    };

    return service;
}

export const speechService = createSpeechService();
