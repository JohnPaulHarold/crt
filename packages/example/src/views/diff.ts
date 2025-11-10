import type { BaseViewInstance, SignallerInstance } from 'crt';
import type { AppViewOptions } from '../index.js';

import {
	normaliseEventTarget,
	diff,
	createBaseView,
	createSignaller,
	watch,
} from 'crt';

import { div, p } from '../html.js';

import { Button } from '../components/Button.js';

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
 * @param event
 */
function handleClick(this: DiffViewInstance, event: MouseEvent) {
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

function getTemplate(this: any): HTMLElement {
	const count = this.lyricCount.getValue();

	const el = (
		div(
			{ className: 'view diff', id: this.id },
			lyrics
				.slice(0, count)
				.map((lyric) => p({ className: 'lyric-line' }, lyric)),
			count < lyrics.length && Button({ id: 'add-lyric' }, 'Add line'),
			count > 0 &&
				Button(
					{
						id: 'remove-lyric',
					},
					'Remove line'
				)
		)
	);

	return el;
}

type DiffViewInstance = BaseViewInstance & {
	lyricCount: SignallerInstance<number>;
	boundHandleClick?: (event: MouseEvent) => void;
	stopWatching?: () => void;
	destructor: () => void;
	viewDidLoad: () => void;
	render: () => HTMLElement;
};

export function createDiffView(options: AppViewOptions): DiffViewInstance {
	const base = createBaseView(
		Object.assign({}, options, { preserveAttributes: ['data-focus'] })
	);

	const diffView: DiffViewInstance = Object.assign({}, base, {
		lyricCount: createSignaller(0),
		boundHandleClick: undefined,
		stopWatching: undefined,

		destructor: function (this: DiffViewInstance) {
			if (this.viewEl && this.boundHandleClick) {
				(this.viewEl as HTMLElement).removeEventListener(
					'click',
					this.boundHandleClick
				);
			}
			if (this.stopWatching) {
				this.stopWatching();
			}
		},

		viewDidLoad: function (this: DiffViewInstance) {
			if (this.viewEl) {
				this.boundHandleClick = handleClick.bind(this);
				(this.viewEl as HTMLElement).addEventListener(
					'click',
					this.boundHandleClick
				);

				const handler = () => {
					if (this.viewEl) {
						const vdom = getTemplate.call(this);
						diff(vdom, this.viewEl, {
							preserveAttributes: this.preserveAttributes,
						});
					}
				};

				this.stopWatching = watch([this.lyricCount], handler);
			}
		},

		render: function (this: DiffViewInstance) {
			return getTemplate.call(this);
		},
	});

	return diffView;
}
