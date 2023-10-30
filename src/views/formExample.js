/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */

import { AdditionalKeys } from '../models/AdditionalKeys';

import { keyMap } from '../config/qwertyKeyMap';

import { BaseView } from '../libs/baseView';
import { div, form, pre } from '../libs/makeElement';
import { NotificationsService } from '../libs/notifications';

import { handleKeydownOnElement } from '../utils/dom/handleKeydownOnElement';
import { assertKey } from '../utils/keys';
import { cx } from '../utils/dom/cx';
import { $dataGet } from '../utils/dom/$dataGet';
import { createReactive } from '../utils/object/createReactive';

import { Notification } from '../components/Notification';
import { Checkbox } from '../components/Checkbox';
import { TextInput } from '../components/TextInput';
import { Keyboard } from '../components/Keyboard';

import { focusInto, moveFocus, setLrudScope } from '../navigation';

import s from './formExample.scss';
import { $dataSet } from '../utils/dom/$dataSet';
import { normaliseEventTarget } from '../utils/dom/normaliseEventTarget';

/**
 * @type {HTMLFormElement}
 */
const MyForm = form(
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

/**
 * @extends BaseView
 */
export class FormExample extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

        /** @type {HTMLInputElement=} */
        this.activeInput = undefined;

        this.keyboard = div(
            {
                className: s.keyboardDrawer,
            },
            Keyboard({ keyMap: keyMap })
        );

        const initialFormState = {
            firstName: '',
            surname: '',
            likescakes: false,
            playagame: false,
        };

        /** @type {Record<string, any>} */
        this.formState = createReactive(
            initialFormState,
            this.updateFormOutput.bind(this)
        );

        this.formOutput = pre(
            { className: s.output },
            JSON.stringify(initialFormState, null, 4)
        );

        /**
         * @type {HTMLFormElement}
         */
        this.formEl = MyForm;
    }

    destructor() {
        this.keydownHandleCleanup && this.keydownHandleCleanup();
    }

    viewDidLoad() {
        this.keydownHandleCleanup = handleKeydownOnElement(
            this.formEl,
            this.handleForm.bind(this)
        );
    }

    /**
     * @name updateFormOutput
     * @param {*} state
     */
    updateFormOutput(state) {
        // update the debug output
        this.formOutput.innerHTML = JSON.stringify(state, null, 4);

        // get the formInputs
        const formInputEls = this.formEl.elements;

        for (const key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                const formEl = formInputEls.namedItem(key);
                if (formEl && formEl instanceof HTMLInputElement) {
                    if (formEl.type === 'checkbox') {
                        const method = state[key]
                            ? 'setAttribute'
                            : 'removeAttribute';

                        formEl[method]('checked', '');
                    }

                    if (formEl.type === 'text') {
                        formEl.value = state[key];
                    }
                }
            }
        }
    }

    listenToKeyboard() {
        this.keyboardHandleCleanup = handleKeydownOnElement(
            this.keyboard,
            this.handleKeyboard.bind(this)
        );
    }

    closeKeyboard() {
        // hide the keyboard
        this.keyboard.classList.remove('active');

        // stop listening to keyboard
        if (this.keyboardHandleCleanup) this.keyboardHandleCleanup();

        // restore focus to the element we were on before
        // whizzing the keyboard into view
        this.activeInput && moveFocus(this.activeInput);

        // restore the scope, undefined is "default"
        setLrudScope();
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleKeyboard(event) {
        const elTarget = normaliseEventTarget(event);
        if (
            elTarget instanceof HTMLElement &&
            assertKey(event, AdditionalKeys.ENTER)
        ) {
            const keyPressValue = $dataGet(elTarget, 'keyValue');
            const inputName = this.activeInput && this.activeInput.name;

            switch (keyPressValue) {
                case 'EXIT':
                    if (inputName) {
                        const prevValue =
                            this.activeInput &&
                            $dataGet(this.activeInput, 'prevValue');
                        this.formState[inputName] = prevValue || '';
                    }
                    this.closeKeyboard();
                    break;
                case 'ENTER':
                    // set the new prevValue on the input
                    inputName &&
                        this.activeInput &&
                        $dataSet(
                            this.activeInput,
                            'prevValue',
                            this.formState[inputName]
                        );
                    this.closeKeyboard();
                    break;
                case 'DEL':
                    if (inputName) {
                        this.formState[inputName] = this.formState[
                            inputName
                        ].slice(0, this.formState[inputName].length - 1);
                    }
                    break;
                default:
                    if (inputName) this.formState[inputName] += keyPressValue;
                    break;
            }
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleForm(event) {
        const elTarget = normaliseEventTarget(event);

        if (assertKey(event, AdditionalKeys.ENTER)) {
            if (
                elTarget instanceof HTMLInputElement &&
                elTarget.type === 'text'
            ) {
                this.activeInput = elTarget;
                // store the current value, in case we cancel
                // and need to restore
                $dataSet(
                    this.activeInput,
                    'prevValue',
                    this.formState[this.activeInput.name]
                );

                // show the keyboard
                this.keyboard.classList.add('active');

                // focus on it
                focusInto(this.keyboard);

                // limit the scope
                setLrudScope(this.keyboard);

                // listen for events on it
                this.listenToKeyboard();
            }

            if (elTarget instanceof HTMLLabelElement) {
                const name = elTarget.htmlFor;
                const qs = `[name="${name}"]`;
                const input = document.querySelector(qs);

                if (input instanceof HTMLInputElement) {
                    this.formState[name] = !input.checked;
                    // const method = input.checked
                    //     ? 'removeAttribute'
                    //     : 'setAttribute';
                    // input[method]('checked', '');

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

        return div(
            {
                className: cxView,
                id: this.id,
            },
            this.formOutput,
            this.formEl,
            this.keyboard
        );
    }
}
