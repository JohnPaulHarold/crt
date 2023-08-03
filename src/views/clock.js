/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */

import { div, span } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';
import { createEffect, createSignal } from '../utils/signals';

import s from './clock.css';

/**
 *
 * @param {number} number
 * @param {number} amount
 * @returns {string}
 */
function zeropad(number, amount) {
    if (number >= Math.pow(10, amount)) {
        return number + '';
    }

    return (Array(amount).join('0') + number).slice(-amount);
}

/**
 * @extends BaseView
 */
export class Clock extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);
        this.time = function () {
            return new Date();
        };

        const time = this.time();

        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        /** @type {function} */
        this.hours;
        /** @type {function} */
        this.minutes;
        /** @type {function} */
        this.seconds;
        /** @type {function} */
        this.setHours;
        /** @type {function} */
        this.setMinutes;
        /** @type {function} */
        this.setSeconds;

        [this.hours, this.setHours] = createSignal(hours);
        [this.minutes, this.setMinutes] = createSignal(minutes);
        [this.seconds, this.setSeconds] = createSignal(seconds);

        this.hoursEl = span({ className: 'hours' }, this.hours());
        this.minutesEl = span({ className: 'minutes' }, this.minutes());
        this.secondsEl = span({ className: 'seconds' }, this.seconds());

        this.timer = window.setInterval(() => {
            const time = this.time();
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const seconds = time.getSeconds();

            this.setHours(hours);
            this.setMinutes(minutes);
            this.setSeconds(seconds);
        }, 1e3);
    }

    viewDidLoad() {
        this.setEffects();
    }

    viewWillUnload() {
        window.clearInterval(this.timer);
    }

    setEffects() {
        createEffect(() => {
            this.hoursEl.textContent = zeropad(this.hours(), 2);
        });
        createEffect(() => {
            this.minutesEl.textContent = zeropad(this.minutes(), 2);
        });
        createEffect(() => {
            this.secondsEl.textContent = zeropad(this.seconds(), 2);
        });
    }

    render() {
        return div(
            { className: 'clock', id: this.id },
            div({ className: s.digital }, [
                this.hoursEl,
                span(':'),
                this.minutesEl,
                span(':'),
                this.secondsEl,
            ])
        );
    }
}
