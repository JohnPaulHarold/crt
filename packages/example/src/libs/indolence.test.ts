/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkImages } from './indolence.js';

describe('indolence/checkImages', () => {
	let scope: HTMLDivElement;

	beforeEach(() => {
		scope = document.createElement('div');
		document.body.appendChild(scope);
		// Mock the viewport height for predictable testing
		Object.defineProperty(document.body, 'clientHeight', {
			configurable: true,
			value: 800,
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	});

	test('should load images that are in the viewport', () => {
		const imgInView = document.createElement('img');
		imgInView.dataset.loaded = 'false';
		imgInView.dataset.src = 'in-view.jpg';
		vi.spyOn(imgInView, 'getBoundingClientRect').mockReturnValue({
			top: 100,
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			toJSON: function () {
				throw new Error('Function not implemented.');
			},
		});

		const imgOutOfView = document.createElement('img');
		imgOutOfView.dataset.loaded = 'false';
		imgOutOfView.dataset.src = 'out-of-view.jpg';
		vi.spyOn(imgOutOfView, 'getBoundingClientRect').mockReturnValue({
			top: 900,
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			toJSON: function () {
				throw new Error('Function not implemented.');
			},
		});

		scope.append(imgInView, imgOutOfView);

		checkImages(scope);

		// Image in view should be processed
		expect(imgInView.src).toContain('in-view.jpg');
		expect(imgInView.dataset.loaded).toBe('true');

		// Image out of view should not be processed
		expect(imgOutOfView.src).toBe('');
		expect(imgOutOfView.dataset.loaded).toBe('false');
	});

	test('should use postBounds to load images just outside the viewport', () => {
		const imgJustOutOfView = document.createElement('img');
		imgJustOutOfView.dataset.loaded = 'false';
		imgJustOutOfView.dataset.src = 'just-out.jpg';
		// top is 850, clientHeight is 800. Normally out of view.
		vi.spyOn(imgJustOutOfView, 'getBoundingClientRect').mockReturnValue({
			top: 850,
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			toJSON: function () {
				throw new Error('Function not implemented.');
			},
		});

		scope.appendChild(imgJustOutOfView);

		// With postBounds of 100, it should be considered in view (850 < 800 + 100)
		checkImages(scope, 100);

		expect(imgJustOutOfView.src).toContain('just-out.jpg');
		expect(imgJustOutOfView.dataset.loaded).toBe('true');
	});

	test('should not process images that are already marked as loaded', () => {
		const imgLoaded = document.createElement('img');
		imgLoaded.dataset.loaded = 'true'; // Already loaded
		imgLoaded.dataset.src = 'loaded.jpg';
		vi.spyOn(imgLoaded, 'getBoundingClientRect').mockReturnValue({
			top: 100,
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			toJSON: function () {
				throw new Error('Function not implemented.');
			},
		});

		scope.appendChild(imgLoaded);

		checkImages(scope);

		// src should not be set again
		expect(imgLoaded.src).toBe('');
	});

	test('should not process images in the viewport that lack a data-src attribute', () => {
		const imgNoSrc = document.createElement('img');
		imgNoSrc.dataset.loaded = 'false';
		// No data-src
		vi.spyOn(imgNoSrc, 'getBoundingClientRect').mockReturnValue({
			top: 100,
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			toJSON: function () {
				throw new Error('Function not implemented.');
			},
		});

		scope.appendChild(imgNoSrc);

		checkImages(scope);

		expect(imgNoSrc.src).toBe('');
		expect(imgNoSrc.dataset.loaded).toBe('false');
	});

	test('should add "loaded" class on image onload event', () => {
		const img = document.createElement('img');
		img.dataset.loaded = 'false';
		img.dataset.src = 'image.jpg';
		vi.spyOn(img, 'getBoundingClientRect').mockReturnValue({
			top: 100,
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			toJSON: function () {
				throw new Error('Function not implemented.');
			},
		});
		scope.appendChild(img);
		checkImages(scope);
		// The onload handler is assigned by checkImages. We need to check it exists
		// and call it with a mock Event to simulate the browser's behavior,
		// satisfying TypeScript's type requirements.
		if (typeof img.onload === 'function') {
			img.onload(new Event('load'));
		}
		expect(img.classList.contains('loaded')).toBe(true);
	});
});
