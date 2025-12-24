/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { dataSet } from './dataSet.js';

describe('dataSet', () => {
	test('it sets a string', () => {
		const mockEl = document.createElement('div');
		const mockDataValue = 'xyz';

		dataSet(mockEl, 'testString', mockDataValue);

		const assert = mockEl.dataset.testString;
		expect(assert).toEqual(mockDataValue);
	});

	test('it sets a bool', () => {
		const mockEl = document.createElement('div');
		const mockDataValue = true;

		dataSet(mockEl, 'testBool', mockDataValue);

		const assert = mockEl.dataset.testBool;
		expect(assert).toEqual(mockDataValue + '');
	});

	test('it sets a number', () => {
		const mockEl = document.createElement('div');
		const mockDataValue = 123;

		dataSet(mockEl, 'testNumber', mockDataValue);

		const assert = mockEl.dataset.testNumber;
		expect(assert).toEqual(mockDataValue + '');
	});

	test('it sets an object', () => {
		const mockEl = document.createElement('div');
		const mockDataValue = { x: 1, y: 2, z: false };

		dataSet(mockEl, 'testObj', mockDataValue);

		const assert = mockEl.dataset.testObj;
		expect(assert).toEqual(JSON.stringify(mockDataValue));
	});
});
