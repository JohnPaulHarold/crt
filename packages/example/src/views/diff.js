import {
    normaliseEventTarget,
    createReactive,
    AdditionalKeys,
    assertKey,
    diff,
    createBaseView,
} from 'crt';

import { div, p } from '../h.js';

import { Button } from '../components/Button.js';

import { navigationService } from '../services/navigationService.js';

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
 * @typedef {object} DiffState
 * @property {number} lyricCount
 */

/**
 * @this {DiffViewInstance}
 * @param {KeyboardEvent | MouseEvent} event
 */
function handlePress(event) {
    if (!this.state) return div({ className: 'view', id: this.id });

    const elTarget = normaliseEventTarget(event);

    if (
        elTarget instanceof HTMLElement &&
        (event instanceof MouseEvent ||
            (event instanceof KeyboardEvent &&
                assertKey(event, AdditionalKeys.ENTER)))
    ) {
        if (elTarget.id === 'add-lyric') {
            this.state.lyricCount++;
        } else {
            this.state.lyricCount--;
        }
    }
}

/**
 * @this {DiffViewInstance}
 * @param {DiffState} newState
 */
function updateDiff(newState) {
    const vdom = getTemplate.call(this);
    const dom = this.viewEl;

    if (dom) {
        diff(vdom, dom);

        if (newState.lyricCount < 1) {
            navigationService.focusInto(dom);
        }
    }
}

/**
 * @returns {HTMLElement}
 * @this {DiffViewInstance}
 */
function getTemplate() {
    if (!this.state) return div({ className: 'view', id: this.id });

    const el = div(
        { className: 'diff', id: this.id },
        lyrics
            .slice(0, this.state.lyricCount)
            .map((lyric) => p({ className: 'lyric-line' }, lyric)),
        this.state.lyricCount < lyrics.length &&
            Button(
                {
                    className: navigationService.isElementFocused('add-lyric')
                        ? 'focused'
                        : '',
                    id: 'add-lyric',
                },
                'Add line'
            ),
        this.state.lyricCount > 0 &&
            Button(
                {
                    className: navigationService.isElementFocused(
                        'remove-lyric'
                    )
                        ? 'focused'
                        : '',
                    id: 'remove-lyric',
                },
                'Remove line'
            )
    );

    return el;
}

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  state: DiffState | null,
 *  boundHandlePress?: (event: KeyboardEvent | MouseEvent) => void,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  render: () => HTMLElement
 * }} DiffViewInstance
 */

/**
 * @param {import('crt').ViewOptions} options
 * @returns {DiffViewInstance}
 */
export function createDiffView(options) {
    const base = createBaseView(options);

    /** @type {DiffViewInstance} */
    const diffView = {
        ...base,
        /** @type {DiffState | null} */
        state: null,
        boundHandlePress: undefined,

        destructor: function () {
            if (this.viewEl && this.boundHandlePress) {
                this.viewEl.removeEventListener('click', this.boundHandlePress);
            }
        },

        viewDidLoad: function () {
            if (this.viewEl) {
                this.boundHandlePress = handlePress.bind(this);
                this.viewEl.addEventListener('click', this.boundHandlePress);
            }
        },

        render: function () {
            return getTemplate.call(this);
        },
    };

    const boundUpdateDiff = updateDiff.bind(diffView);
    diffView.state = createReactive({ lyricCount: 0 }, boundUpdateDiff);

    return diffView;
}
