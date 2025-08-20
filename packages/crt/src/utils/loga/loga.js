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

/**
 * @typedef {object} LogStyles
 * @property {string} ERROR - CSS style for error messages.
 * @property {string} WARN - CSS style for warning messages.
 * @property {string} INFO - CSS style for info messages.
 * @property {string} LOG - CSS style for general log messages.
 * @property {string} SUCCESS - CSS style for success log messages.
 */

/**
 * Defines styles for different log levels.
 * @type {LogStyles}
 */
const STYLES = {
    ERROR: 'color: #c0392b; font-weight: bold;', // Red, bold
    WARN: 'color: black; background-color: #f39c12; font-weight: bold; padding: 2px 4px; border-radius: 3px;', // Black text on Orange background, bold
    INFO: 'color: #2980b9;', // Blue
    LOG: 'color: #7f8c8d;', // Gray
    SUCCESS:
        'color: white; background-color: #27ae60; font-weight: bold; padding: 2px 4px; border-radius: 3px;', // Black text on Orange background, bold
};

/**
 * @typedef {object} LogMethodConfig
 * @property {ConsoleMethodName} consoleMethod
 * @property {string} style
 * @property {string} prefix
 * @property {number} level
 */

/**
 * Configuration for each log method.
 * @type {Record<string, LogMethodConfig>}
 */
const LOG_METHODS_CONFIG = {
    log: {
        consoleMethod: 'log',
        style: STYLES.LOG,
        prefix: '[LOG]',
        level: LogLevel.LOG,
    },
    info: {
        consoleMethod: 'info',
        style: STYLES.INFO,
        prefix: '[INFO]',
        level: LogLevel.INFO,
    },
    warn: {
        consoleMethod: 'warn',
        style: STYLES.WARN,
        prefix: '[WARN]',
        level: LogLevel.WARN,
    },
    error: {
        consoleMethod: 'error',
        style: STYLES.ERROR,
        prefix: '[ERROR]',
        level: LogLevel.ERROR,
    },
    success: {
        consoleMethod: 'log',
        style: STYLES.SUCCESS,
        prefix: '[SUCCESS]',
        level: LogLevel.SUCCESS,
    },
};
/**
 * @typedef {'log' | 'info' | 'warn' | 'error'} ConsoleMethodName
 */

/**
 * Helper function to perform the actual logging with styling.
 * @private
 * @param {ConsoleMethodName} consoleMethodName - The name of the console method to use.
 * @param {string} style - The CSS style string to apply.
 * @param {string} prefix - The prefix string for the log message (e.g., '[ERROR]').
 * @param {any[]} args - The arguments to log.
 */
const _logWithStyle = (consoleMethodName, style, prefix, args) => {
    // Access the method on the console object at call time to allow for spying in tests.
    // This is crucial because test runners replace the methods on the global `console` object,
    // and we need to use the replaced version, not a reference to the original.
    console[consoleMethodName](`%c${prefix}`, style, ...args);
};

/**
 * @typedef {object} PrefixedLogaInstance
 * @property {(...args: any[]) => void} log - Logs general messages with a prefix.
 * @property {(...args: any[]) => void} info - Logs informational messages with a prefix.
 * @property {(...args: any[]) => void} warn - Logs warning messages with a prefix.
 * @property {(...args: any[]) => void} error - Logs error messages with a prefix.
 * @property {(...args: any[]) => void} success - Logs success messages with a prefix.
 */

/**
 * @typedef {object} LogaInstance
 * @property {(...args: any[]) => void} log - Logs general messages.
 * @property {(...args: any[]) => void} info - Logs informational messages.
 * @property {(...args: any[]) => void} warn - Logs warning messages.
 * @property {(...args: any[]) => void} error - Logs error messages.
 * @property {(...args: any[]) => void} success - Logs success messages.
 * @property {(componentPrefix: string) => PrefixedLogaInstance} create - Creates a new logger instance with a specific component prefix.
 * @property {(level: number) => void} setLogLevel - Sets the current logging level.
 * @property {(enable: boolean) => void} setDebugMode - Enables or disables all logging (overrides level).
 * @property {() => number} getLogLevel - Gets the current logging level.
 * @property {() => boolean} getDebugMode - Gets the current debug mode state.
 */

/** @type {LogaInstance} */
export const loga = {
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
     * @param {string} componentPrefix
     * @returns {PrefixedLogaInstance}
     */
    create: (componentPrefix) => {
        const createLoggerMethod = (
            /** @type {ConsoleMethodName} */ methodName,
            /** @type {string} */ style,
            /** @type {string} */ basePrefix,
            /** @type {number} */ messageLogLevel
        ) => {
            const fullPrefix = `${basePrefix}[${componentPrefix}]`;
            /**
             * @param {...any} args
             */
            return (...args) => {
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
            info: createLoggerMethod(
                'info',
                STYLES.INFO,
                '[INFO]',
                LogLevel.INFO
            ),
            warn: createLoggerMethod(
                'warn',
                STYLES.WARN,
                '[WARN]',
                LogLevel.WARN
            ),
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
