import {
	AdditionalKeys,
	type AdditionalKeysType,
} from '../models/AdditionalKeys.js';
import { Direction, type DirectionType } from '../models/Direction.js';
import { Orientation, type OrientationType } from '../models/Orientation.js';

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

const keyCodeMap: Record<number, DirectionType> = {
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
 * @param keyCode
 */
export function getDirectionFromKeyCode(keyCode: number): DirectionType {
	return keyCodeMap[keyCode];
}

/**
 *
 * @param direction
 */
export function getOrientationFromDirection(direction: DirectionType) {
	if ([Direction.LEFT, Direction.RIGHT].indexOf(direction) > -1) {
		return Orientation.HORIZONTAL;
	}

	return Orientation.VERTICAL;
}

/**
 *
 * @param event
 * @param expectation
 */
export function assertKey(
	event: KeyboardEvent,
	expectation: AdditionalKeysType | AdditionalKeysType[]
) {
	if (Array.isArray(expectation)) {
		return expectation.indexOf(keyCodeMap[event.keyCode]) > -1;
	}

	if (keyCodeMap[event.keyCode] === expectation) {
		return true;
	}

	return false;
}

/**
 * @param keyCode
 */
export function getOrientationFromKeyCode(keyCode: number): OrientationType {
	const v = [_up, _down];
	const dir = getDirectionFromKeyCode(keyCode);

	if (v.indexOf(dir) > -1) {
		return Orientation.VERTICAL;
	}

	return Orientation.HORIZONTAL;
}
