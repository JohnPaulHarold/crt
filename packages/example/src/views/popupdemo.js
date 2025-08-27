import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';

import { createBaseView } from 'crt';

import { div, p } from '../html.js';

import { appOutlets } from '../outlets.js';
import { navigationService } from '../services/navigationService.js';

import { registerPopup } from '../libs/registerPopup';

/**
 * @typedef {import('../libs/registerPopup').RegisteredPopup} RegisteredPopup
 */

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  popup: RegisteredPopup | null,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  handlePopup: (id: string) => void,
 *  openPopup: () => void,
 *  render: () => HTMLElement
 * }} PopupDemoViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {PopupDemoViewInstance}
 */
export function createPopupDemoView(options) {
	const base = createBaseView(options);

	/** @type {PopupDemoViewInstance} */
	const popupDemoView = {
		...base,
		popup: null,

		destructor: function () {
			if (this.popup && this.popup.close) {
				this.popup.close();
			}
		},

		viewDidLoad: function () {
			if (!appOutlets.popups) return;

			const dialogEl = createDialog();
			const handler = this.handlePopup.bind(this);
			this.popup = registerPopup(dialogEl, handler, appOutlets.popups);
		},

		handlePopup: function (id) {
			if (!this.viewEl) return;

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

		openPopup: function () {
			if (this.popup) this.popup.open();
		},

		render: function () {
			const buttonEl = Button(
				{
					id: 'btn-show-popup',
					onclick: this.openPopup.bind(this),
				},
				'Show Popup'
			);
			return div({ className: 'view', id: this.id }, buttonEl);
		},
	};

	return popupDemoView;
}

function createDialog() {
	return Dialog(
		{
			title: 'My Title',
			id: 'my-title',
		},
		[
			p({}, 'Hey, I have something to tell you...'),
			Button({ id: 'btn-ok' }, 'OK'),
			Button({ id: 'btn-cancel' }, 'Cancel'),
		]
	);
}
