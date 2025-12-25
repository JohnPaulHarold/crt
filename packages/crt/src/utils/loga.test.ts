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
	type MockInstance,
} from 'vitest';
import { loga, LogLevel } from './loga.js';

describe('loga', () => {
	let logSpy: MockInstance;
	let infoSpy: MockInstance;
	let warnSpy: MockInstance;
	let errorSpy: MockInstance;

	beforeEach(() => {
		// Reset to defaults before each test
		loga.setDebugMode(true);
		loga.setLogLevel(LogLevel.LOG);
		vi.clearAllMocks();
		// Spy on console methods
		logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		// Restore original console methods after all tests in this file
		vi.restoreAllMocks();
	});

	describe('Direct Logging', () => {
		test('should call console.log for loga.log', () => {
			loga.log('test message');
			expect(logSpy).toHaveBeenCalledWith(
				'%c[LOG]',
				expect.any(String),
				'test message'
			);
		});

		test('should call console.info for loga.info', () => {
			loga.info('info message');
			expect(infoSpy).toHaveBeenCalledWith(
				'%c[INFO]',
				expect.any(String),
				'info message'
			);
		});

		test('should call console.warn for loga.warn', () => {
			loga.warn('warn message');
			expect(warnSpy).toHaveBeenCalledWith(
				'%c[WARN]',
				expect.any(String),
				'warn message'
			);
		});

		test('should call console.error for loga.error', () => {
			loga.error('error message');
			expect(errorSpy).toHaveBeenCalledWith(
				'%c[ERROR]',
				expect.any(String),
				'error message'
			);
		});

		test('should call console.log for loga.success', () => {
			loga.success('success message');
			expect(logSpy).toHaveBeenCalledWith(
				'%c[SUCCESS]',
				expect.any(String),
				'success message'
			);
		});
	});

	describe('Log Level Filtering', () => {
		test('should not log messages below the current log level', () => {
			loga.setLogLevel(LogLevel.WARN);
			loga.info('should not appear');
			loga.log('should not appear');
			expect(infoSpy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
		});

		test('should log messages at or above the current log level', () => {
			loga.setLogLevel(LogLevel.WARN);
			loga.warn('should appear');
			loga.error('should also appear');
			expect(warnSpy).toHaveBeenCalledTimes(1);
			expect(errorSpy).toHaveBeenCalledTimes(1);
		});

		test('should log nothing when level is NONE', () => {
			loga.setLogLevel(LogLevel.NONE);
			loga.error('should not appear');
			expect(errorSpy).not.toHaveBeenCalled();
		});

		test('should warn when setting an invalid log level', () => {
			loga.setLogLevel(999); // An invalid level
			expect(warnSpy).toHaveBeenCalledWith(
				'[Loga] Invalid log level: 999. Please use LogLevel enum values.'
			);
		});
	});

	describe('Debug Mode', () => {
		test('should disable all logging when debug mode is false', () => {
			loga.setDebugMode(false);
			loga.setLogLevel(LogLevel.LOG); // Highest level
			loga.error('should not appear');
			loga.warn('should not appear');
			loga.info('should not appear');
			loga.log('should not appear');
			loga.success('should not appear');

			expect(errorSpy).not.toHaveBeenCalled();
			expect(warnSpy).not.toHaveBeenCalled();
			expect(infoSpy).not.toHaveBeenCalled();
			expect(logSpy).not.toHaveBeenCalled();
		});
	});

	describe('Prefixed Logger', () => {
		test('should create a logger with a component prefix', () => {
			const componentLogger = loga.create('MyComponent');
			componentLogger.info('component message');
			expect(infoSpy).toHaveBeenCalledWith(
				'%c[INFO][MyComponent]',
				expect.any(String),
				'component message'
			);
		});

		test('prefixed logger should respect global log level', () => {
			loga.setLogLevel(LogLevel.WARN);
			const componentLogger = loga.create('FilterTest');
			componentLogger.info('should not log');
			componentLogger.warn('should log');

			expect(infoSpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledTimes(1);
		});

		test('prefixed logger should respect global debug mode', () => {
			loga.setDebugMode(false);
			const componentLogger = loga.create('DebugTest');
			componentLogger.error('should not log');

			expect(errorSpy).not.toHaveBeenCalled();
		});
	});
});
