/**
 * @readonly
 * @enum {number}
 */
export const LogLevel = {
	NONE: 0,
	ERROR: 1,
	WARN: 2,
	SUCCESS: 3, // A positive status, more important than general info
	INFO: 4,
	LOG: 5, // General debug logs, most verbose
};

let CURRENT_LOG_LEVEL = LogLevel.LOG; // Default log level
let DEBUG_MODE = true; // Overall on/off switch, separate from level for quick disabling

interface LogStyles {
	ERROR: string;
	WARN: string;
	INFO: string;
	LOG: string;
	SUCCESS: string;
}

/**
 * Defines styles for different log levels.
 */
const STYLES: LogStyles = {
	ERROR: 'color: #c0392b; font-weight: bold;', // Red, bold
	WARN: 'color: black; background-color: #f39c12; font-weight: bold; padding: 2px 4px; border-radius: 3px;', // Black text on Orange background, bold
	INFO: 'color: #2980b9;', // Blue
	LOG: 'color: #7f8c8d;', // Gray
	SUCCESS:
		'color: white; background-color: #27ae60; font-weight: bold; padding: 2px 4px; border-radius: 3px;', // Black text on Orange background, bold
};

type ConsoleMethodName = 'log' | 'info' | 'warn' | 'error';

/**
 * Helper function to perform the actual logging with styling.
 * @private
 * @param consoleMethodName - The name of the console method to use.
 * @param style - The CSS style string to apply.
 * @param prefix - The prefix string for the log message (e.g., '[ERROR]').
 * @param args - The arguments to log.
 */
const _logWithStyle = (
	consoleMethodName: ConsoleMethodName,
	style: string,
	prefix: string,
	args: unknown[]
) => {
	// Access the method on the console object at call time to allow for spying in tests.
	// This is crucial because test runners replace the methods on the global `console` object,
	// and we need to use the replaced version, not a reference to the original.
	console[consoleMethodName](`%c${prefix}`, style, ...args);
};

export interface PrefixedLogaInstance {
	log: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	success: (...args: unknown[]) => void;
}

export interface LogaInstance {
	log: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	success: (...args: unknown[]) => void;
	create: (componentPrefix: string) => PrefixedLogaInstance;
	setLogLevel: (level: number) => void;
	setDebugMode: (enable: boolean) => void;
	getLogLevel: () => number;
	getDebugMode: () => boolean;
}

export const loga: LogaInstance = {
	success: (...args) => {
		if (DEBUG_MODE && CURRENT_LOG_LEVEL >= LogLevel.SUCCESS)
			_logWithStyle('log', STYLES.SUCCESS, '[SUCCESS]', args);
	},
	log: (...args) => {
		if (DEBUG_MODE && CURRENT_LOG_LEVEL >= LogLevel.LOG)
			_logWithStyle('log', STYLES.LOG, '[LOG]', args);
	},
	info: (...args) => {
		if (DEBUG_MODE && CURRENT_LOG_LEVEL >= LogLevel.INFO)
			_logWithStyle('info', STYLES.INFO, '[INFO]', args);
	},
	warn: (...args) => {
		if (DEBUG_MODE && CURRENT_LOG_LEVEL >= LogLevel.WARN)
			_logWithStyle('warn', STYLES.WARN, '[WARN]', args);
	},
	error: (...args) => {
		// Errors are often critical, so they might bypass DEBUG_MODE if needed,
		// but for consistency, we'll keep it. Or, you could have:
		// if (CURRENT_LOG_LEVEL >= LogLevel.ERROR) _logWithStyle(console.error, STYLES.ERROR, '[ERROR]', args);
		if (DEBUG_MODE && CURRENT_LOG_LEVEL >= LogLevel.ERROR)
			_logWithStyle('error', STYLES.ERROR, '[ERROR]', args);
	},

	/**
	 * @param componentPrefix
	 * @returns {PrefixedLogaInstance}
	 */
	create: (componentPrefix: string): PrefixedLogaInstance => {
		const createLoggerMethod = (
			methodName: ConsoleMethodName,
			style: string,
			basePrefix: string,
			messageLogLevel: number
		) => {
			const fullPrefix = `${basePrefix}[${componentPrefix}]`;
			return (...args: unknown[]) => {
				if (DEBUG_MODE && CURRENT_LOG_LEVEL >= messageLogLevel) {
					_logWithStyle(methodName, style, fullPrefix, args);
				}
			};
		};

		// Note: This method returns a static object literal instead of dynamically
		// building it in a loop. While a loop would be more DRY, this explicit
		// approach is more robust for static analysis and prevents type inference
		// issues with TypeScript's `checkJs`.
		return {
			log: createLoggerMethod('log', STYLES.LOG, '[LOG]', LogLevel.LOG),
			info: createLoggerMethod('info', STYLES.INFO, '[INFO]', LogLevel.INFO),
			warn: createLoggerMethod('warn', STYLES.WARN, '[WARN]', LogLevel.WARN),
			error: createLoggerMethod(
				'error',
				STYLES.ERROR,
				'[ERROR]',
				LogLevel.ERROR
			),
			success: createLoggerMethod(
				'log',
				STYLES.SUCCESS,
				'[SUCCESS]',
				LogLevel.SUCCESS
			),
		};
	},
	setLogLevel: (level) => {
		// Check if the provided level is a valid value in the LogLevel enum
		const isValid = Object.values(LogLevel).includes(level);
		if (isValid) {
			CURRENT_LOG_LEVEL = level;
		} else {
			console.warn(
				`[Loga] Invalid log level: ${level}. Please use LogLevel enum values.`
			);
		}
	},
	setDebugMode: (enable) => {
		DEBUG_MODE = Boolean(enable);
	},
	getLogLevel: () => {
		return CURRENT_LOG_LEVEL;
	},
	getDebugMode: () => {
		return DEBUG_MODE;
	},
};
