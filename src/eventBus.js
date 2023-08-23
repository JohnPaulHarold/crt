/**
 * @constructs EventBus
 * @param {string} [description]
 */
export function EventBus(description) {
    const commentEl = document.createComment(description || '');
    this.eventTarget = document.appendChild(commentEl);
}

EventBus.prototype = {
    /**
     * @name on
     * @memberof EventBus#
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     */
    on: function (type, listener) {
        this.eventTarget.addEventListener(type, listener);
    },

    /**
     * @name once
     * @memberof EventBus#
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @todo implement the "once" concept
     */
    once: function (type, listener) {
        this.eventTarget.addEventListener(type, listener);
    },

    /**
     * @name off
     * @memberof EventBus#
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     */
    off: function (type, listener) {
        this.eventTarget.removeEventListener(type, listener);
    },

    /**
     * @name emit
     * @memberof EventBus#
     * @param {string} type
     * @param {*} detail
     */
    emit: function (type, detail) {
        return this.eventTarget.dispatchEvent(
            new CustomEvent(type, { detail })
        );
    },
};
