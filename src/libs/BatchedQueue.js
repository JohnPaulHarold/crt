import { noop } from '../utils/function/noop';

/**
 * @constructor
 * @param {function} handleFull
 * @param {number} batchInterval
 * @param {number} size
 */
export function BatchedQueue(handleFull, batchInterval, size) {
    const defaultSize = 10;
    const defaultBatchInterval = 5e3;

    /**
     * @type {Array<*>}
     */
    this.data = [];
    this.size = size || defaultSize;
    this.handleFull = handleFull || noop;
    /** @type {NodeJS.Timeout|null} */
    this.timer = null;
    this.batchInterval = batchInterval || defaultBatchInterval;
}

BatchedQueue.prototype = {
    /**
     * @memberof BatchedQueue
     * @param {*} element
     */
    enqueue(element) {
        this.clearSweep();

        if (this.data.length < this.size) {
            this.data.push(element);
        } else {
            /**
             * @type {Array<*>}
             */
            const data = [].concat(this.data);

            this.handleFull(data);
            this.clear(data.length);

            this.data.push(element);
        }

        // restart the sweep
        this.sweep();
    },

    /**
     * @memberof BatchedQueue
     * @returns
     */
    sweep() {
        this.timer = setTimeout(() => {
            /**
             * @type {Array<*>}
             */
            const data = [].concat(this.data);

            if (data.length > 0) {
                this.handleFull(data);
                this.clear(data.length);
            }
        }, this.batchInterval);
    },

    /**
     * @memberof BatchedQueue
     */
    clearSweep() {
        if (this.timer) clearInterval(this.timer);
    },

    /**
     * @memberof BatchedQueue
     * @returns
     */
    length() {
        return this.data.length;
    },

    /**
     * @memberof BatchedQueue
     * @returns
     */
    isEmpty() {
        return this.data.length === 0;
    },

    /**
     * @memberof BatchedQueue
     * @returns
     */
    getFront() {
        if (this.isEmpty() === false) {
            return this.data[0];
        }
    },

    /**
     * @memberof BatchedQueue
     * @returns
     */
    getLast() {
        if (!this.isEmpty()) {
            return this.data[this.data.length - 1];
        }
    },

    /**
     * @memberof BatchedQueue
     * @returns
     */
    dequeue() {
        if (!this.isEmpty()) {
            return this.data.shift();
        }
    },

    /**
     * @memberof BatchedQueue
     * @param {*} len
     */
    clear(len) {
        this.data = this.data.slice(len);
    },
};
