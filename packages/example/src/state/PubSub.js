import { loga } from 'crt';

/**
 * @typedef {object} PubSubInstance
 * @property {(payload: any) => void} broadcast
 * @property {() => void} [_resetForTesting] - Clears all listeners, for use in tests only.
 * @property {(id: string, payload: any) => void} emit
 * @property {(id: string, callback: (...args: any[]) => void, once?: boolean) => void} on
 * @property {(id: string, callback: (...args: any[]) => void) => void} once
 * @property {(id: string) => void} off
 */

/**
 * Creates a new PubSub instance.
 * @returns {PubSubInstance}
 */
function createPubSub() {
    /** @type {Record<string, ((...args: any[]) => void)[]>} */
    let listeners = {};
    const logr = loga.create('PubSub');

    /** @type {PubSubInstance} */
    const instance = {
        broadcast(payload) {
            Object.keys(listeners).forEach((key) => {
                instance.emit(key, payload);
            });
        },

        emit(id, payload) {
            const callbacks = listeners[id];

            if (callbacks && callbacks.length) {
                // Create a copy of the callbacks array in case `off` is called during emit
                [...callbacks].forEach((callback) => callback(payload));
            }
        },

        on(id, callback, once) {
            if (!callback || typeof callback !== 'function') {
                logr.warn(
                    `[on] You must pass a function as the second argument to PubSub.on()`
                );
                return;
            }

            listeners[id] = listeners[id] || [];
            /**
             * @param {...any} args
             */
            const handler = (...args) => {
                callback(...args);
                if (once) {
                    instance.off(id);
                }
            };
            listeners[id].push(handler);
        },

        once(id, callback) {
            if (!callback || typeof callback !== 'function') {
                logr.warn(
                    `[once] You must pass a function as the second argument to PubSub.once()`
                );
                return;
            }
            instance.on(id, callback, true);
        },

        off(id) {
            if (listeners[id]) {
                delete listeners[id];
            }
        },

        // This method is intended for use in testing environments only
        // to ensure test isolation.
        _resetForTesting() {
            listeners = {};
        },
    };

    return instance;
}

export const pubSub = createPubSub();
