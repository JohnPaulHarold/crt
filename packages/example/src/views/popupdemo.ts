import type { BaseViewInstance } from 'crt';
import type { RegisteredPopup } from '../libs/registerPopup';
import type { AppViewOptions } from '..';

import { createBaseView } from 'crt';

import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { div, p } from '../html.js';
import { appOutlets } from '../outlets.js';
import { navigationService } from '../services/navigationService.js';
import { registerPopup } from '../libs/registerPopup';

type PopupDemoViewInstance = BaseViewInstance & {
	popup: RegisteredPopup | null;
	destructor: () => void;
	viewDidLoad: () => void;
	handlePopup: (id: string) => void;
	openPopup: () => void;
	render: () => HTMLElement;
};

/**
 * @param options
 */
export function createPopupDemoView(options: AppViewOptions): PopupDemoViewInstance {
	const base = createBaseView(options);

	const popupDemoView: PopupDemoViewInstance = Object.assign({}, base, {
		popup: null,

		destructor: function (this: PopupDemoViewInstance) {
			if (this.popup && this.popup.close) {
				this.popup.close();
			}
		},

		viewDidLoad: function (this: PopupDemoViewInstance) {
			if (!appOutlets.popups || !(appOutlets.popups instanceof HTMLElement))
				return;

			const dialogEl = createDialog();
			const handler = this.handlePopup.bind(this);
			this.popup = registerPopup(dialogEl, handler, appOutlets.popups);
		},

		handlePopup: function (this: PopupDemoViewInstance, id: string) {
			if (!this.viewEl || !(this.viewEl instanceof HTMLElement)) return;

			switch (id) {
				case 'btn-cancel':
				case 'dialog-close':
					if (this.popup) this.popup.close();
					navigationService.focusInto(this.viewEl);
					break;
				case 'btn-ok':
					// go off and do whatever the OK is for: i.e: save some user settings
					if (this.popup) this.popup.close();
					navigationService.focusInto(this.viewEl);
					break;
				case 'open':
					break;
				default:
					break;
			}
		},

		openPopup: function (this: PopupDemoViewInstance) {
			if (this.popup) this.popup.open();
		},

		render: function (this: PopupDemoViewInstance) {
			const buttonEl = Button(
				{
					id: 'btn-show-popup',
					onclick: this.openPopup.bind(this),
				},
				'Show Popup'
			);
			return (
				div({ className: 'view', id: this.id }, buttonEl)
			);
		},
	});

	return popupDemoView;
}

function createDialog() {
	return Dialog(
		{
			title: 'My Title',
			id: 'my-title',
		},
		[
			(
				p({}, 'Hey, I have something to tell you...')
			),
			Button({ id: 'btn-ok' }, 'OK'),
			Button({ id: 'btn-cancel' }, 'Cancel'),
		]
	);
}
