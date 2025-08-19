import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';

import {
    handleKeydownOnElement,
    normaliseEventTarget,
    assertKey,
    AdditionalKeys,
    createBaseView,
    div,
    p,
} from 'crt';

import { appOutlets } from '../outlets.js';
import { focusInto } from '../navigation.js';

import { registerPopup } from '../libs/registerPopup';

/**
 * @param {import('crt/types').ViewOptions} options
 * @returns {import('crt/types').BaseViewInstance}
 */
export function createPopupDemoView(options) {
    const base = createBaseView(options);

    const buttonEl = Button(
        {
            id: 'btn-show-popup',
        },
        'Show Popup'
    );

    const popupDemoView = {
        ...base,
        popup: null,
        pressHandleCleanup: null,

        destructor: function () {
            if (this.pressHandleCleanup) {
                this.pressHandleCleanup();
            }
            if (this.popup && this.popup.destroy) {
                this.popup.destroy();
            }
        },

        viewDidLoad: function () {
            this.pressHandleCleanup = handleKeydownOnElement(
                buttonEl,
                this.handlePresses.bind(this)
            );
        },

        handlePresses: function (event) {
            const elTarget = normaliseEventTarget(event);

            if (
                elTarget instanceof HTMLElement &&
                (event instanceof MouseEvent ||
                    (event instanceof KeyboardEvent &&
                        assertKey(event, AdditionalKeys.ENTER)))
            ) {
                if (elTarget.id === 'btn-show-popup') {
                    this.openPopup();
                }
            }
        },

        handlePopup: function (id) {
            switch (id) {
                case 'btn-cancel':
                case 'dialog-close':
                    this.popup.close();
                    focusInto(this.viewEl);
                    break;
                case 'btn-ok':
                    // go off and do whatever the OK is for: i.e: save some user settings
                    this.popup.close();
                    focusInto(this.viewEl);
                    break;
                case 'open':
                    break;
                default:
                    break;
            }
        },

        openPopup: function () {
            this.popup.open();
        },

        render: function () {
            return div({ className: 'view', id: this.id }, buttonEl);
        },
    };

    const dialogEl = Dialog(
        {
            title: 'My Title',
            id: 'my-title',
        },
        [
            p(
                { className: 'my-popup-text' },
                'Hey, I have something to tell you...'
            ),
            Button({ id: 'btn-ok' }, 'OK'),
            Button({ id: 'btn-cancel' }, 'Cancel'),
        ]
    );

    const handler = popupDemoView.handlePopup.bind(popupDemoView);
    popupDemoView.popup = registerPopup(dialogEl, handler, appOutlets.popups);

    return popupDemoView;
}
