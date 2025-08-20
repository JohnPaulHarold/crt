/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { speechService } from './speechService.js';

describe('speechService', () => {
    /** @type {{speak: import('vitest').Mock, cancel: import('vitest').Mock}} */
    let mockSynthesis;
    /** @type {any} */
    let MockUtterance;

    // Store original dependencies
    const originalSpeechSynthesis = window.speechSynthesis;
    const originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

    beforeEach(() => {
        mockSynthesis = {
            speak: vi.fn(),
            cancel: vi.fn(),
        };
        MockUtterance = class {
            /** @param {string} text */
            constructor(text) {
                this.text = text;
            }
        };
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original dependencies to the service after each test
        if (speechService._setDependenciesForTesting) {
            speechService._setDependenciesForTesting(
                originalSpeechSynthesis,
                originalSpeechSynthesisUtterance
            );
        }
        vi.restoreAllMocks();
    });

    describe('when SpeechSynthesis is supported', () => {
        beforeEach(() => {
            // Inject mocks before each test in this block
            if (speechService._setDependenciesForTesting) {
                speechService._setDependenciesForTesting(
                    /** @type {SpeechSynthesis} */ (
                        /** @type {any} */ (mockSynthesis)
                    ),
                    MockUtterance
                );
            }
        });

        test('speak() should cancel previous speech and speak new text', () => {
            speechService.speak('Hello world');

            expect(mockSynthesis.cancel).toHaveBeenCalledTimes(1);
            expect(mockSynthesis.speak).toHaveBeenCalledTimes(1);

            const utterance = mockSynthesis.speak.mock.calls[0][0];
            expect(utterance).toBeInstanceOf(MockUtterance);
            expect(utterance.text).toBe('Hello world');
        });

        test('speak() should not do anything if text is empty', () => {
            speechService.speak('');
            expect(mockSynthesis.cancel).not.toHaveBeenCalled();
            expect(mockSynthesis.speak).not.toHaveBeenCalled();
        });

        test('cancel() should call the injected cancel method', () => {
            speechService.cancel();
            expect(mockSynthesis.cancel).toHaveBeenCalledTimes(1);
        });
    });

    describe('when SpeechSynthesis is not supported', () => {
        test('should not throw errors when methods are called', () => {
            // Inject undefined dependencies to simulate a non-supporting environment.
            if (speechService._setDependenciesForTesting) {
                speechService._setDependenciesForTesting(undefined, undefined);
            }

            // Verify that calling the methods does not cause a runtime error.
            expect(() => speechService.speak('test')).not.toThrow();
            expect(() => speechService.cancel()).not.toThrow();
        });
    });
});
