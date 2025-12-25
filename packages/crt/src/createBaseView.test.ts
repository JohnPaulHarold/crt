/**
 * @vitest-environment jsdom
 */
import type { BaseViewInstance } from './types.js';

import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createBaseView } from './createBaseView.js';
import { type PrefixedLogaInstance, loga } from './utils/loga.js';

// Mock the logger to spy on its methods
vi.mock('./utils/loga', async (importOriginal) => {
	const actual = await importOriginal<typeof import('./utils/loga.js')>();
	const logrMock = {
		error: vi.fn(),
		warn: vi.fn(),
		info: vi.fn(),
		log: vi.fn(),
	};
	return {
		...actual,
		loga: {
			...actual.loga,
			create: () => logrMock,
		},
	};
});

describe('createBaseView', () => {
	let logrMock: PrefixedLogaInstance;

	beforeEach(() => {
		// Get the mock for the 'BaseView' logger instance
		logrMock = loga.create('BaseView');
		vi.clearAllMocks();
	});

	test('should throw an error if no options are provided', () => {
		// @ts-expect-error - Intentionally testing invalid input
		expect(() => createBaseView()).toThrow(
			'[createBaseView] An `id` is required in the options.'
		);
	});

	test('should throw an error if no id is provided in options', () => {
		// @ts-expect-error - Intentionally testing invalid input
		expect(() => createBaseView({})).toThrow(
			'[createBaseView] An `id` is required in the options.'
		);
	});

	test('should return a valid view object', () => {
		const view = createBaseView({ id: 'test-view' });
		expect(view).toBeDefined();
		expect(view.id).toBe('test-view');
		expect(view.viewEl).toBeNull();
		expect(typeof view.attach).toBe('function');
		expect(typeof view.detach).toBe('function');
		expect(typeof view.render).toBe('function');
	});

	describe('render', () => {
		test('should return a div with the view id and log a warning', () => {
			const view = createBaseView({ id: 'test-render' });
			const el = view.render();

			expect(el).toBeInstanceOf(HTMLDivElement);
			expect(el.id).toBe('test-render');
			expect(logrMock.warn).toHaveBeenCalledWith(
				'[render] The \'render\' method for view "test-render" is not implemented. Returning an empty div.'
			);
		});
	});

	describe('attach', () => {
		test('should render and append the view to a parent element', () => {
			const parentEl = document.createElement('div');
			const view = createBaseView({ id: 'test-attach' });

			view.attach(parentEl);

			expect(parentEl.children.length).toBe(1);
			expect(parentEl.children[0].id).toBe('test-attach');
			expect(view.viewEl).toBe(parentEl.children[0]);
		});

		test('should call viewDidLoad asynchronously after attaching', () => {
			vi.useFakeTimers();
			const parentEl = document.createElement('div');
			const view = createBaseView({ id: 'test-viewDidLoad' });
			view.viewDidLoad = vi.fn();

			view.attach(parentEl);

			expect(view.viewDidLoad).not.toHaveBeenCalled();
			vi.runAllTimers();
			expect(view.viewDidLoad).toHaveBeenCalledTimes(1);
			vi.useRealTimers();
		});

		test('should log an error if parentEl is not valid', () => {
			const view = createBaseView({ id: 'test-no-parent' });
			// @ts-expect-error - Intentionally testing invalid input
			view.attach(null);

			expect(logrMock.error).toHaveBeenCalledWith(
				'[attach] Cannot attach view "test-no-parent". The parent element is not valid.'
			);
		});
	});

	test('should move the element without re-rendering if attached to a new parent', () => {
		const parentEl1 = document.createElement('div');
		const parentEl2 = document.createElement('div');
		const view = createBaseView({ id: 'test-re-attach' });
		const renderSpy = vi.spyOn(view, 'render');

		// First attach
		view.attach(parentEl1);
		expect(renderSpy).toHaveBeenCalledTimes(1);
		expect(parentEl1.children.length).toBe(1);

		// Attach to a new parent without detaching first.
		// This should move the existing view.viewEl, not create a new one.
		view.attach(parentEl2);
		expect(renderSpy).toHaveBeenCalledTimes(1); // Should not be called again
		expect(parentEl1.children.length).toBe(0); // Should be removed from old parent
		expect(parentEl2.children.length).toBe(1);
		expect(parentEl2.children[0].id).toBe('test-re-attach');
	});

	describe('detach', () => {
		let parentEl: HTMLDivElement;
		let view: BaseViewInstance;

		beforeEach(() => {
			parentEl = document.createElement('div');
			document.body.appendChild(parentEl);
			view = createBaseView({ id: 'test-detach' });
		});

		afterEach(() => {
			document.body.innerHTML = '';
		});

		test('should remove the view from the DOM and call destructor', () => {
			view.destructor = vi.fn();
			view.attach(parentEl);

			expect(parentEl.children.length).toBe(1);

			view.detach();

			expect(parentEl.children.length).toBe(0);
			expect(view.destructor).toHaveBeenCalledTimes(1);
		});

		test('should set viewEl to null after detaching', () => {
			view.attach(parentEl);
			expect(view.viewEl).toBeInstanceOf(HTMLElement);

			view.detach();
			expect(view.viewEl).toBeNull();
		});

		test('should not throw if detaching an unattached view', () => {
			expect(() => view.detach()).not.toThrow();
		});

		test('should handle detaching a rendered but unattached view', () => {
			view.destructor = vi.fn();

			// Render the view but don't attach it to the DOM
			view.viewEl = view.render();
			expect(view.viewEl).not.toBeNull();
			expect(view.viewEl.parentElement).toBeNull();

			// Detach should still work
			view.detach();

			expect(view.destructor).toHaveBeenCalledTimes(1);
			expect(view.viewEl).toBeNull();
		});
	});
});
