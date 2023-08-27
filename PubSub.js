export function PubSub() {
    /**
     * @type { {[index: string]: any[]} }
     */
    this.listeners = {};
}

PubSub.prototype = {
    /**
     *
     * @param {*} payload
     */
    broadcast(payload) {
        Object.keys(this.listeners).forEach((key) => {
            this.emit(key, payload);
        });
    },

    /**
     *
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
     *
     * @param {string} id
     * @param {*} callback
     */
    on(id, callback) {
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
    off(id) {
        if (this.listeners[id]) {
            delete this.listeners[id];
        }
    },
};
