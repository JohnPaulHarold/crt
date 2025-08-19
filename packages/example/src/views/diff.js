import {
    normaliseEventTarget,
    createReactive,
    AdditionalKeys,
    assertKey,
    diff,
    BaseView,
    div,
    p,
} from 'crt';

import { Button } from '../components/Button.js';

import { focusInto, isElementFocused } from '../navigation.js';

const lyrics = [
    'All men have secrets and here is mine',
    'So let it be known',
    'For we have been through hell and high tide',
    'I can surely rely on you',
    'And yet you start to recoil',
    'Heavy words are so lightly thrown',
    "But still I'd leap in front of a flying bullet for you",
    'So, what difference does it make?',
    'So, what difference does it make?',
    'It makes none',
    'But now you have gone',
    'And you must be looking very old tonight',
    'The devil will find work for idle hands to do',
    'I stole and I lied, and why?',
    'Because you asked me to!',
    'But now you make me feel so ashamed',
    "Because I've only got two hands",
    "But I'm still fond of you, oh-ho-oh",
    'So, what difference does it make? (Oooooh)',
    'What difference does it make? (Oooooh)',
    'It makes none',
    'But now you have gone',
    "And your prejudice won't keep you warm tonight",
];

/**
 * @typedef {Object} DiffState
 * @property {number} lyricCount
 */

/**
 * @typedef {BaseView & Diff} DiffView
 */

/**
 * @constructor
 * @param {import('crt').ViewOptions} options
 * @this DiffView
 */
export function Diff(options) {
    BaseView.call(this, options);

    const initialState = { lyricCount: 0 };

    /** @type {DiffState} */
    this.state = createReactive(initialState, this.updateDiff.bind(this));
}

// inherit from BaseView
Diff.prototype = Object.create(BaseView.prototype);
// Set the constructor back
Diff.prototype.constructor = Diff;

// prototype methods

/**
 * @this {DiffView}
 */
Diff.prototype.destructor = function () {
    this.viewEl.removeEventListener(
        'click',
        this.handlePress.bind(this)
    );
}

/**
 * @this {DiffView}
 */
Diff.prototype.viewDidLoad = function () {
    this.viewEl.addEventListener('click', this.handlePress.bind(this));
}

/**
 *
 * @param {KeyboardEvent | MouseEvent} event
 */
Diff.prototype.handlePress = function (event) {
    const elTarget = normaliseEventTarget(event);

    if (
        elTarget instanceof HTMLElement &&
        (
            event instanceof MouseEvent ||
            event instanceof KeyboardEvent && assertKey(event, AdditionalKeys.ENTER)
        )
    ) {
        if (elTarget.id === 'add-lyric') {
            this.state.lyricCount++;
        } else {
            this.state.lyricCount--;
        }
    }
}

/**
 *
 * @param {DiffState} newState
 * @this {DiffView}
 */
Diff.prototype.updateDiff = function (newState) {
    const vdom = this.getTemplate();
    const dom = this.viewEl;

    diff(vdom, dom);

    if (newState.lyricCount < 1 && dom) {
        focusInto(dom);
    }
}

/**
 * @this {DiffView}
 * @returns {HTMLElement}
 */
Diff.prototype.getTemplate = function () {
    return div(
        { className: 'diff', id: this.id },
        lyrics
            .slice(0, this.state.lyricCount)
            .map((lyric) => p({ className: 'lyric-line' }, lyric)),
        this.state.lyricCount < lyrics.length &&
            Button(
                {
                    className: isElementFocused('add-lyric')
                        ? 'focused'
                        : '',
                    id: 'add-lyric',
                },
                'Add line'
            ),
        this.state.lyricCount > 0 &&
            Button(
                {
                    className: isElementFocused('remove-lyric')
                        ? 'focused'
                        : '',
                    id: 'remove-lyric',
                },
                'Remove line'
            )
    );
}

/**
 * @this {DiffView}
 * @returns {HTMLElement}
 */
Diff.prototype.render = function () {
    return this.getTemplate();
}
