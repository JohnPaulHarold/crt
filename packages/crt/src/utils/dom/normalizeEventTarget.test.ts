/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, afterEach } from 'vitest';
import { normalizeEventTarget } from './normalizeEventTarget.js';

function createMockMouseEvent(partialEvent: Partial<MouseEvent>): MouseEvent {
	return {
		altKey: false,
		button: 0,
		buttons: 0,
		clientX: 0,
		clientY: 0,
		ctrlKey: false,
		layerX: 0,
		layerY: 0,
		metaKey: false,
		movementX: 0,
		movementY: 0,
		offsetX: 0,
		offsetY: 0,
		pageX: 0,
		pageY: 0,
		relatedTarget: null,
		screenX: 0,
		screenY: 0,
		shiftKey: false,
		x: 0,
		y: 0,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getModifierState: function (keyArg: string): boolean {
			throw new Error('Function not implemented.');
		},
		initMouseEvent: function (
			_typeArg: string,
			_canBubbleArg: boolean,
			_cancelableArg: boolean,
			_viewArg: Window,
			_detailArg: number,
			_screenXArg: number,
			_screenYArg: number,
			_clientXArg: number,
			_clientYArg: number,
			_ctrlKeyArg: boolean,
			_altKeyArg: boolean,
			_shiftKeyArg: boolean,
			_metaKeyArg: boolean,
			_buttonArg: number,
			_relatedTargetArg: EventTarget | null
		): void {
			throw new Error('Function not implemented.');
		},
		detail: 0,
		view: null,
		which: 0,
		initUIEvent: function (
			_typeArg: string,
			_bubblesArg?: boolean | undefined,
			_cancelableArg?: boolean | undefined,
			_viewArg?: Window | null | undefined,
			_detailArg?: number | undefined
		): void {
			throw new Error('Function not implemented.');
		},
		bubbles: false,
		cancelBubble: false,
		cancelable: false,
		composed: false,
		currentTarget: null,
		defaultPrevented: false,
		eventPhase: 0,
		isTrusted: false,
		returnValue: false,
		srcElement: null,
		target: null,
		timeStamp: 0,
		type: '',
		composedPath: function (): EventTarget[] {
			throw new Error('Function not implemented.');
		},
		initEvent: function (
			_type: string,
			_bubbles?: boolean | undefined,
			_cancelable?: boolean | undefined
		): void {
			throw new Error('Function not implemented.');
		},
		preventDefault: function (): void {
			throw new Error('Function not implemented.');
		},
		stopImmediatePropagation: function (): void {
			throw new Error('Function not implemented.');
		},
		stopPropagation: function (): void {
			throw new Error('Function not implemented.');
		},
		NONE: 0,
		CAPTURING_PHASE: 1,
		AT_TARGET: 2,
		BUBBLING_PHASE: 3,
		...partialEvent,
	};
}

describe('normalizeEventTarget', () => {
	afterEach(() => {
		// Clean up the DOM after each test
		document.body.innerHTML = '';
	});

	test('should return event.target if it is a valid element', () => {
		const button = document.createElement('button');
		const event = createMockMouseEvent({ target: button });
		const result = normalizeEventTarget(event);
		expect(result).toBe(button);
	});

	test('should return document.activeElement if event.target is the window', () => {
		// Setup: create an element and make it the active element
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.focus();

		expect(document.activeElement).toBe(input);

		// Simulate an event where the target is the window
		const event = createMockMouseEvent({ target: window });
		const result = normalizeEventTarget(event);

		// Expect the fallback to the active element
		expect(result).toBe(input);
	});

	test('should return document.activeElement if event.target is null', () => {
		// Setup: create an element and make it the active element
		const link = document.createElement('a');
		document.body.appendChild(link);
		// An `<a>` tag must have an `href` to be focusable in jsdom
		link.href = '#';
		link.focus();

		expect(document.activeElement).toBe(link);

		// Simulate an event where the target is null
		const event = createMockMouseEvent({ target: null });
		const result = normalizeEventTarget(event);

		// Expect the fallback to the active element
		expect(result).toBe(link);
	});
});
