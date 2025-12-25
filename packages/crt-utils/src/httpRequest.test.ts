/**
 * @vitest-environment jsdom
 */
import {
	describe,
	expect,
	test,
	vi,
	beforeEach,
	afterEach,
	type Mock,
} from 'vitest';
import { httpRequest } from './httpRequest.js';

interface MockXHR {
	open: Mock;
	send: Mock;
	setRequestHeader: Mock;
	onreadystatechange: () => void;
	readyState: number;
	status: number;
	statusText: string;
	response: string | null;
	responseType: string;
}

describe('httpRequest', () => {
	let mockXHR: MockXHR;

	beforeEach(() => {
		// This object will simulate an XMLHttpRequest instance
		mockXHR = {
			open: vi.fn(),
			send: vi.fn(),
			setRequestHeader: vi.fn(),
			onreadystatechange: () => {}, // This will be assigned by the `request` function
			readyState: 0,
			status: 0,
			statusText: '',
			response: null,
			responseType: '',
		};

		// Stub the global XMLHttpRequest constructor to return our mock object
		vi.stubGlobal(
			'XMLHttpRequest',
			vi.fn(() => mockXHR)
		);
	});

	afterEach(() => {
		// Restore the original XMLHttpRequest constructor after each test
		vi.restoreAllMocks();
	});

	test('should return JSON data on a successful request', async () => {
		const mockData = { message: 'Success' };

		// When `send` is called, simulate a successful response
		mockXHR.send.mockImplementation(() => {
			mockXHR.status = 200;
			mockXHR.readyState = 4; // DONE
			mockXHR.response = JSON.stringify(mockData);
			mockXHR.onreadystatechange(); // Trigger the handler
		});

		const data = await httpRequest({ url: '/api/data', type: 'json' });

		expect(mockXHR.open).toHaveBeenCalledWith('GET', '/api/data', true);
		expect(mockXHR.send).toHaveBeenCalled();
		expect(data).toEqual(mockData);
	});

	test('should return a non-JSON response as is', async () => {
		const mockResponseText = '<xml>data</xml>';

		mockXHR.send.mockImplementation(() => {
			mockXHR.status = 200;
			mockXHR.readyState = 4;
			mockXHR.response = mockResponseText;
			mockXHR.onreadystatechange();
		});

		const data = await httpRequest({ url: '/api/xml', type: 'text' });
		expect(data).toBe(mockResponseText);
	});

	test('should throw an error for a non-ok response (e.g., 404)', async () => {
		mockXHR.send.mockImplementation(() => {
			mockXHR.status = 404;
			mockXHR.statusText = 'Not Found';
			mockXHR.readyState = 4;
			mockXHR.onreadystatechange();
		});

		await expect(httpRequest({ url: '/api/not-found' })).rejects.toEqual({
			status: 404,
			statusText: 'Not Found',
		});
	});

	test('should set request headers if provided', async () => {
		const headers = { 'Content-Type': 'application/json' };

		// We don't need to await the result, just check if the setup is correct
		httpRequest({
			url: '/api/data',
			method: 'POST',
			headers: headers,
			body: '{}',
		});

		expect(mockXHR.setRequestHeader).toHaveBeenCalledWith(
			'Content-Type',
			'application/json'
		);
	});
});
