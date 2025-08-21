import { AdditionalKeys } from '../models/AdditionalKeys';
import { Direction } from '../models/Direction';
import { Orientation } from '../models/Orientation';

const _left = Direction.LEFT;
const _right = Direction.RIGHT;
const _up = Direction.UP;
const _down = Direction.DOWN;
const _enter = AdditionalKeys.ENTER;
const _escape = AdditionalKeys.ESCAPE;
const _backspace = AdditionalKeys.BACKSPACE;
const _red = AdditionalKeys.RED;
const _yellow = AdditionalKeys.YELLOW;
const _green = AdditionalKeys.GREEN;
const _blue = AdditionalKeys.BLUE;

/** @type {Record<number, Direction>} */
const keyCodeMap = {
	37: _left,
	38: _up,
	39: _right,
	40: _down,
	13: _enter,
	27: _escape,
	8: _backspace,
	82: _red,
	89: _yellow,
	71: _green,
	66: _blue,
};

/**
 * @param {number} keyCode
 * @returns {Direction}
 */
export function getDirectionFromKeyCode(keyCode) {
	return keyCodeMap[keyCode];
}

/**
 *
 * @param {Direction} direction
 * @returns
 */
export function getOrientationFromDirection(direction) {
	if ([Direction.LEFT, Direction.RIGHT].indexOf(direction) > -1) {
		return Orientation.HORIZONTAL;
	}

	return Orientation.VERTICAL;
}

/**
 *
 * @param {KeyboardEvent} event
 * @param {AdditionalKeys|AdditionalKeys[]} expectation
 */
export function assertKey(event, expectation) {
	if (Array.isArray(expectation)) {
		return expectation.indexOf(keyCodeMap[event.keyCode]) > -1;
	}

	if (keyCodeMap[event.keyCode] === expectation) {
		return true;
	}

	return false;
}

/**
 * getOrientationFromKeyCode
 * @param {number} keyCode
 * @returns {Orientation}
 */
export function getOrientationFromKeyCode(keyCode) {
	const v = [_up, _down];
	const dir = getDirectionFromKeyCode(keyCode);

	if (v.indexOf(dir) > -1) {
		return Orientation.VERTICAL;
	}

	return Orientation.HORIZONTAL;
}
