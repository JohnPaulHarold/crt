import { describe, expect, test } from 'vitest';
import {
	getDirectionFromKeyCode,
	getOrientationFromDirection,
	assertKey,
	getOrientationFromKeyCode,
} from './keys.js';
import { Direction } from './Direction.js';
import { Orientation } from './Orientation.js';
import { AdditionalKeys } from './AdditionalKeys.js';

function createMockKeyboardEvent(
	partialEvent: Partial<KeyboardEvent>
): KeyboardEvent {
	return {
		keyCode: 13,
		altKey: false,
		charCode: 0,
		code: '',
		ctrlKey: false,
		isComposing: false,
		key: '',
		location: 0,
		metaKey: false,
		repeat: false,
		shiftKey: false,
		getModifierState: function (_keyArg: string): boolean {
			throw new Error('Function not implemented.');
		},
		initKeyboardEvent: function (
			_typeArg: string,
			_bubblesArg?: boolean | undefined,
			_cancelableArg?: boolean | undefined,
			_viewArg?: Window | null | undefined,
			_keyArg?: string | undefined,
			_locationArg?: number | undefined,
			_ctrlKey?: boolean | undefined,
			_altKey?: boolean | undefined,
			_shiftKey?: boolean | undefined,
			_metaKey?: boolean | undefined
		): void {
			throw new Error('Function not implemented.');
		},
		DOM_KEY_LOCATION_STANDARD: 0,
		DOM_KEY_LOCATION_LEFT: 1,
		DOM_KEY_LOCATION_RIGHT: 2,
		DOM_KEY_LOCATION_NUMPAD: 3,
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

describe('keys utilities', () => {
	describe('getDirectionFromKeyCode', () => {
		test('should return the correct direction for arrow keys', () => {
			expect(getDirectionFromKeyCode(37)).toBe(Direction.LEFT);
			expect(getDirectionFromKeyCode(38)).toBe(Direction.UP);
			expect(getDirectionFromKeyCode(39)).toBe(Direction.RIGHT);
			expect(getDirectionFromKeyCode(40)).toBe(Direction.DOWN);
		});

		test('should return the correct value for additional keys', () => {
			expect(getDirectionFromKeyCode(13)).toBe(AdditionalKeys.ENTER);
			expect(getDirectionFromKeyCode(27)).toBe(AdditionalKeys.ESCAPE);
		});

		test('should return undefined for an unknown key code', () => {
			expect(getDirectionFromKeyCode(999)).toBeUndefined();
		});
	});

	describe('getOrientationFromDirection', () => {
		test('should return HORIZONTAL for LEFT and RIGHT directions', () => {
			expect(getOrientationFromDirection(Direction.LEFT)).toBe(
				Orientation.HORIZONTAL
			);
			expect(getOrientationFromDirection(Direction.RIGHT)).toBe(
				Orientation.HORIZONTAL
			);
		});

		test('should return VERTICAL for UP and DOWN directions', () => {
			expect(getOrientationFromDirection(Direction.UP)).toBe(
				Orientation.VERTICAL
			);
			expect(getOrientationFromDirection(Direction.DOWN)).toBe(
				Orientation.VERTICAL
			);
		});

		test('should return VERTICAL for non-directional keys', () => {
			expect(getOrientationFromDirection(AdditionalKeys.ENTER)).toBe(
				Orientation.VERTICAL
			);
		});
	});

	describe('assertKey', () => {
		test('should return true for a matching single expectation', () => {
			const event: KeyboardEvent = createMockKeyboardEvent({
				keyCode: 13,
			});
			expect(assertKey(event, AdditionalKeys.ENTER)).toBe(true);
		});

		test('should return false for a non-matching single expectation', () => {
			const event = createMockKeyboardEvent({ keyCode: 27 });
			expect(assertKey(event, AdditionalKeys.ENTER)).toBe(false);
		});

		test('should return true if key is in an array of expectations', () => {
			const event = createMockKeyboardEvent({ keyCode: 39 });
			expect(assertKey(event, [Direction.LEFT, Direction.RIGHT])).toBe(true);
		});

		test('should return false if key is not in an array of expectations', () => {
			const event = createMockKeyboardEvent({ keyCode: 38 });
			expect(assertKey(event, [Direction.LEFT, Direction.RIGHT])).toBe(false);
		});
	});

	describe('getOrientationFromKeyCode', () => {
		test('should return HORIZONTAL for left and right arrow keys', () => {
			expect(getOrientationFromKeyCode(37)).toBe(Orientation.HORIZONTAL);
			expect(getOrientationFromKeyCode(39)).toBe(Orientation.HORIZONTAL);
		});

		test('should return VERTICAL for up and down arrow keys', () => {
			expect(getOrientationFromKeyCode(38)).toBe(Orientation.VERTICAL);
			expect(getOrientationFromKeyCode(40)).toBe(Orientation.VERTICAL);
		});

		test('should return HORIZONTAL for other keys like Enter', () => {
			// Based on the implementation, non-vertical keys default to horizontal
			expect(getOrientationFromKeyCode(13)).toBe(Orientation.HORIZONTAL);
		});
	});
});
