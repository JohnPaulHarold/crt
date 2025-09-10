/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

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
		// Mock the console.warn to prevent test output pollution
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		// Restore original window properties
		Object.defineProperty(window, 'speechSynthesis', {
			value: originalSpeechSynthesis,
			writable: true,
		});
		Object.defineProperty(window, 'SpeechSynthesisUtterance', {
			value: originalSpeechSynthesisUtterance,
			writable: true,
		});
		// Reset Vitest mocks and modules to ensure test isolation
		vi.restoreAllMocks();
		vi.resetModules();
	});

	describe('when SpeechSynthesis is supported', () => {
		/** @type {import('./speechService.js').SpeechServiceInstance} */
		let speechService;

		beforeEach(async () => {
			// Mock the browser APIs *before* importing the service
			Object.defineProperty(window, 'speechSynthesis', {
				value: mockSynthesis,
				writable: true,
			});
			Object.defineProperty(window, 'SpeechSynthesisUtterance', {
				value: MockUtterance,
				writable: true,
			});

			// Dynamically import the service to get a fresh instance
			// with the mocked environment.
			const serviceModule = await import('./speechService.js');
			speechService = serviceModule.speechService;
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
		/** @type {import('./speechService.js').SpeechServiceInstance} */
		let speechService;

		beforeEach(async () => {
			// Simulate an unsupported environment *before* importing
			Object.defineProperty(window, 'speechSynthesis', {
				value: undefined,
				writable: true,
			});

			// Dynamically import the service
			const serviceModule = await import('./speechService.js');
			speechService = serviceModule.speechService;
		});

		test('should not throw errors when methods are called', () => {
			// Verify that calling the methods does not cause a runtime error.
			expect(() => speechService.speak('test')).not.toThrow();
			expect(() => speechService.cancel()).not.toThrow();
		});
	});
});
