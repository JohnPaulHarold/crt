import {
	normaliseEventTarget,
	AdditionalKeys,
	assertKey,
	diff,
	createBaseView,
	createSignaller,
	watch,
} from 'crt';

import { div, p } from '../html.js';

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
 * @this {DiffViewInstance}
 * @param {MouseEvent} event
 */
function handleClick(event) {
	const elTarget = normaliseEventTarget(event);

	if (elTarget instanceof HTMLElement) {
		// The navigationService now handles translating 'Enter' keydowns into clicks,
		// so this handler only needs to deal with the resulting click event.
		if (elTarget.id === 'add-lyric') {
			this.lyricCount.setValue(this.lyricCount.getValue() + 1);
		} else if (elTarget.id === 'remove-lyric') {
			this.lyricCount.setValue(this.lyricCount.getValue() - 1);
		}
	}
}

/**
 * @returns {HTMLElement}
 * @this {DiffViewInstance}
 */
function getTemplate() {
	const count = this.lyricCount.getValue();

	const el = div(
		{ className: 'diff', id: this.id },
		lyrics
			.slice(0, count)
			.map((lyric) => p({ className: 'lyric-line' }, lyric)),
		count < lyrics.length &&
			Button(
				{
					className: navigationService.isElementFocused('add-lyric')
						? 'focused'
						: '',
					id: 'add-lyric',
				},
				'Add line'
			),
		count > 0 &&
			Button(
				{
					className: navigationService.isElementFocused('remove-lyric')
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
 *  lyricCount: import('crt').SignallerInstance,
 *  boundHandleClick?: (event: MouseEvent) => void,
 *  stopWatching?: () => void,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  render: () => HTMLElement
 * }} DiffViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {DiffViewInstance}
 */
export function createDiffView(options) {
	const base = createBaseView(options);

	/** @type {DiffViewInstance} */
	const diffView = {
		...base,
		lyricCount: createSignaller(0),
		boundHandleClick: undefined,
		stopWatching: undefined,

		destructor: function () {
			if (this.viewEl && this.boundHandleClick) {
				this.viewEl.removeEventListener('click', this.boundHandleClick);
			}
			if (this.stopWatching) {
				this.stopWatching();
			}
		},

		viewDidLoad: function () {
			if (this.viewEl) {
				this.boundHandleClick = handleClick.bind(this);
				this.viewEl.addEventListener('click', this.boundHandleClick);

				const handler = () => {
					if (this.viewEl) {
						const vdom = getTemplate.call(this);
						diff(vdom, this.viewEl);
					}
				};

				this.stopWatching = watch([this.lyricCount], handler);
			}
		},

		render: function () {
			return getTemplate.call(this);
		},
	};

	return diffView;
}
