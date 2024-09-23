/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').PageData} PageData
 */

import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';

import { AdditionalKeys } from '../models/AdditionalKeys';

import { BaseView } from '../libs/baseView';
import { div, p } from '../libs/makeElement';
import { appOutlets } from '../outlets';

import { focusInto } from '../navigation';

import { assertKey } from '../utils/keys';
import { registerPopup } from '../utils/registerPopup';
import { normaliseEventTarget } from '../utils/dom/normaliseEventTarget';
import { handleKeydownOnElement } from '../utils/dom/handleKeydownOnElement';

/**
 * @extends BaseView
 * @typedef {BaseView & Popupdemo} PopupdemoView
 */

/**
 * @constructor
 * @param {ViewOptions} options
 * @this PopupdemoView
 */
export function Popupdemo(options) {
    BaseView.call(this, options);

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

    this.button = Button(
        {
            id: 'btn-show-popup',
        },
        'Show Popup'
    );
    this.popup = registerPopup(dialogEl, handler, appOutlets.popups);

    this.listenForPresses();  
}

// inherit from BaseView
Popupdemo.prototype = Object.create(BaseView.prototype);
// Set the constructor back
Popupdemo.prototype.constructor = Popupdemo;

Popupdemo.prototype.destructor = function () {
    if (this.pressHandleCleanup) {
        this.pressHandleCleanup();
    }

    this.pressHandleCleanup = null;
}

/**
 * @this PopupdemoView
 */
Popupdemo.prototype.listenForPresses = function () {
    this.pressHandleCleanup = handleKeydownOnElement(
        this.button,
        this.handlePresses.bind(this)
    );
}

/**
 *
 * @param {KeyboardEvent | MouseEvent} event
 */
Popupdemo.prototype.handlePresses = function (event) {
    const elTarget = normaliseEventTarget(event);

    if (
        elTarget instanceof HTMLElement &&
        (
            event instanceof MouseEvent ||
            event instanceof KeyboardEvent && assertKey(event, AdditionalKeys.ENTER)
        )
    ) {
        if (elTarget.id === 'btn-show-popup') {
            this.openPopup();
        }
    }
}

/**
 *
 * @param {string} id
 * @this {PopupdemoView}
 */
Popupdemo.prototype.handlePopup = function (id) {
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

Popupdemo.prototype.openPopup = function () {
    this.popup.open();
}

/**
 * @this {PopupdemoView}
 * @returns {HTMLElement}
 */
Popupdemo.prototype.render = function () {
    return div(
        { className: 'view', id: this.id },
        this.button
    );
}
