/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').PageData} PageData
 */

import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';

import { AdditionalKeys } from '../models/AdditionalKeys';

import { BaseView } from '../libs/baseView';
import { div, p } from '../libs/makeElement';
import { appOutlets } from '../main';

import { focusInto } from '../navigation';

import { assertKey } from '../utils/keys';
import { registerPopup } from '../utils/registerPopup';

/**
 * @extends BaseView
 */
export class Popupdemo extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

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

        const handler = this.handlePopup.bind(this);

        this.popup = registerPopup(dialogEl, handler, appOutlets.popups);
    }

    destructor() {}

    viewDidLoad() {
        this.viewEl.addEventListener('keydown', (e) => {
            e.preventDefault();

            if (
                e.target &&
                e.target instanceof HTMLElement &&
                assertKey(e, AdditionalKeys.ENTER)
            ) {
                if (e.target.id === 'btn-show-popup') {
                    this.openPopup();
                }
            }
        });
    }

    /**
     *
     * @param {string} id
     */
    handlePopup(id) {
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
    }

    openPopup() {
        this.popup.open();
    }

    render() {
        return div(
            { className: 'view', id: this.id },
            Button(
                {
                    id: 'btn-show-popup',
                },
                'Show Popup'
            )
        );
    }
}
