import { loga } from "crt";

/**
 * @constructs PubSub
 */
export function PubSub() {
    /**
     * @type { {[index: string]: any[]} }
     */
    this.listeners = {};
    this.logr = loga.create('PubSub');
}

PubSub.prototype = {
    /**
     * @param {*} payload
     */
    broadcast(payload) {
        Object.keys(this.listeners).forEach((key) => {
            this.emit(key, payload);
        });
    },

    /**
     * @param {string} id
     * @param {*} payload
     */
    emit(id, payload) {
        const callbacks = this.listeners[id];

        if (callbacks && callbacks.length) {
            callbacks.forEach((callback) => callback(payload));
        }
    },

    /**
     * @param {string} id
     * @param {function} callback
     * @param {boolean=} once
     */
    on(id, callback, once) {
        if (!callback || typeof callback !== 'function') {
            this.logr.warn(
                `[on] You must pass a function as the second argument to PubSub.on()`
            );
        }
        const self = this;

        this.listeners[id] = this.listeners[id] || [];
        this.listeners[id].push(function () {
            callback.apply(self, arguments);
            if (once) {
                self.off(id);
            }
        });
    },

    /**
     * @param {string} id
     * @param {function} callback
     */
    once(id, callback) {
        if (!callback || typeof callback !== 'function') {
            this.logr.warn(
                `[once] You must pass a function as the second argument to PubSub.once()`
            );
        }

        this.on(id, callback, true);
    },

    /**
     * @param {string} id
     */
    off(id) {
        if (this.listeners[id]) {
            delete this.listeners[id];
        }
    },
};
