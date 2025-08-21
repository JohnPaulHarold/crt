/**
 * Watches an array of signallers and calls a handler when any of them change.
 * Batches multiple changes within a single event loop tick into one handler call.
 * @param {import('../../types.js').SignallerInstance[]} signallers
 * @param {(changedSignallers: import('../../types.js').SignallerInstance[]) => void} handler
 * @returns {() => void} A function to stop watching.
 */
export function watch(signallers, handler) {
    let isScheduled = false;
    /** @type {import('../../types.js').SignallerInstance[]} */
    let changed = [];

    /**
     * @param {import('../../types.js').SignallerInstance} signaller
     */
    const callback = (signaller) => {
        if (changed.indexOf(signaller) === -1) {
            changed.push(signaller);
        }
        if (!isScheduled) {
            isScheduled = true;
            // Use setTimeout to batch all changes that occur in the same tick.
            setTimeout(wake, 0);
        }
    };

    const wake = () => {
        const signalsToProcess = changed;
        changed = [];
        isScheduled = false;
        handler(signalsToProcess);
    };

    signallers.forEach((s) => s.wait(callback));

    /**
     * The function returned to the caller to stop watching.
     */
    return () => signallers.forEach((s) => s.unwait(callback));
}
