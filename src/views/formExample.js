/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */

import { AdditionalKeys } from '../enums/AdditionalKeys';

import { BaseView } from '../libs/baseView';
import { div, form } from '../libs/makeElement';
import { NotificationsService } from '../libs/notifications';

import { handleKeydownOnElement } from '../utils/dom/handleKeydownOnElement';
import { assertKey } from '../utils/keys';

import { Notification } from '../components/Notification';

import s from './formExample.css';
import { cx } from '../utils/dom/cx';
import { Checkbox } from '../components/Checkbox';
import { TextInput } from '../components/TextInput';

/**
 * @extends BaseView
 */
export class FormExample extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

        this.formEl = form(
            { className: s.myForm },
            TextInput({
                id: 'firstName',
                label: 'First name',
            }),
            TextInput({
                id: 'surname',
                label: 'Surname',
            }),
            Checkbox({
                id: 'likescakes',
                label: 'Likes cakes?',
            }),
            Checkbox({
                id: 'playagame',
                label: 'Global Thermonuclear War?',
            })
        );
    }

    destructor() {
        this.keyHandleCleanup && this.keyHandleCleanup();
    }

    viewDidLoad() {
        this.keyHandleCleanup = handleKeydownOnElement(
            this.formEl,
            this.handleForm.bind(this)
        );
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleForm(event) {
        if (assertKey(event, AdditionalKeys.ENTER)) {
            if (event.target instanceof HTMLLabelElement) {
                console.log(`[this.id][handleForm] `, event);
                const input = document.getElementsByName(
                    event.target.htmlFor
                )[0];

                if (input instanceof HTMLInputElement) {
                    const method = input.checked
                        ? 'removeAttribute'
                        : 'setAttribute';
                    input[method]('checked', '');

                    NotificationsService.sendNotification(
                        Notification({
                            message:
                                input.name + ': checked ? ' + input.checked,
                        })
                    );
                }
            }
        }
    }

    render() {
        const cxView = cx('view', s.view);

        return div({ className: cxView, id: this.id }, this.formEl);
    }
}
