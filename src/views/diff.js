/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */

import { div, p } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';
import { diff } from '../libs/differenceEngine';

import { Button } from '../components/Button';

import { assertKey } from '../utils/keys';

import { AdditionalKeys } from '../models/AdditionalKeys';
import { focusInto, isElementFocused } from '../navigation';
import { createReactive } from '../utils/object/createReactive';

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
 * @extends BaseView
 */
export class Diff extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

        const initialState = { lyricCount: 0 };

        /** @type {DiffState} */
        this.state = createReactive(initialState, this.updateDiff.bind(this));
    }

    destructor() {
        this.viewEl.removeEventListener(
            'keydown',
            this.handleKeyDown.bind(this)
        );
    }

    viewDidLoad() {
        this.viewEl.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     *
     * @param {KeyboardEvent} e
     */
    handleKeyDown(e) {
        e.preventDefault();

        if (
            e.target &&
            e.target instanceof HTMLElement &&
            assertKey(e, AdditionalKeys.ENTER)
        ) {
            if (e.target.id === 'add-lyric') {
                this.state.lyricCount++;
            } else {
                this.state.lyricCount--;
            }
        }
    }

    /**
     *
     * @param {DiffState} newState
     */
    updateDiff(newState) {
        const vdom = this.getTemplate();
        const dom = this.viewEl;

        diff(vdom, dom);

        if (newState.lyricCount < 1 && dom) {
            focusInto(dom);
        }
    }

    /**
     *
     * @returns {HTMLElement}
     */
    getTemplate() {
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

    render() {
        return this.getTemplate();
    }
}
