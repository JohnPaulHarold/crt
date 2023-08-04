/**
 * @typedef {import('../declarations/types').StoreType} StoreType
 */

/** @type {StoreType} */
export const store = {
    listeners: {},

    broadcast(payload) {
        Object.keys(this.listeners).forEach((key) => {
            this.triggerListener(key, payload);
        });
    },

    triggerListener(id, payload) {
        const callbacks = this.listeners[id];

        if (callbacks && callbacks.length) {
            callbacks.forEach((callback) => callback(payload));
        }
    },

    listen(id, callback) {
        if (!callback || typeof callback !== 'function') {
            console.warn(
                `You must pass a function as the second argument to store.listen()`
            );
        }

        this.listeners[id] = this.listeners[id] || [];
        this.listeners[id].push(callback);
    },

    /**
     *
     * @param {string} id
     */
    unlisten(id) {
        if (this.listeners[id]) {
            delete this.listeners[id];
        }
    },
};
