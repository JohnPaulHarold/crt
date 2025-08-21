import { loga } from './utils/loga/loga.js';

const logr = loga.create('BaseView');

/**
 * Creates a base view object with common lifecycle methods and properties.
 * This serves as the foundation for all other views in the application.
 *
 * @param {import('./types').ViewOptions} options - The options for creating the view.
 * @returns {import('./types').BaseViewInstance} A new base view instance.
 */
export function createBaseView(options) {
    if (!options || !options.id) {
        throw new Error('[createBaseView] An `id` is required in the options.');
    }

    /** @type {import('./types').BaseViewInstance} */
    const view = {
        id: options.id,
        viewEl: null, // Initialize as null, not undefined

        /**
         * Attaches the view's rendered element to a parent element in the DOM.
         * It also triggers the `viewDidLoad` lifecycle method if it exists.
         * @param {HTMLElement} parentEl - The parent element to attach to.
         */
        attach(parentEl) {
            if (!parentEl) {
                logr.error(
                    `[attach] Cannot attach view "${this.id}". The parent element is not valid.`
                );
                return;
            }

            if (!this.viewEl) {
                this.viewEl = this.render();
            }

            parentEl.appendChild(this.viewEl);

            // Safely call viewDidLoad after the element is in the DOM.
            if (this.viewDidLoad) {
                // Use setTimeout to ensure the call is asynchronous and non-blocking.
                setTimeout(this.viewDidLoad.bind(this), 0);
            }
        },

        /**
         * Detaches the view's element from the DOM and triggers cleanup.
         * It calls the `destructor` method if it exists.
         */
        detach() {
            // Safely call the destructor before removing the element.
            if (this.destructor) {
                this.destructor();
            }

            if (this.viewEl && this.viewEl.parentElement) {
                this.viewEl.parentElement.removeChild(this.viewEl);
            }

            this.viewEl = null;
        },

        /**
         * Renders the view's HTML element.
         * This method must be implemented by the specific view that extends this base.
         * @returns {HTMLElement}
         */
        render() {
            // This is a placeholder. The actual view must override this method.
            logr.warn(
                `[render] The 'render' method for view "${this.id}" is not implemented. Returning an empty div.`
            );
            const el = document.createElement('div');
            el.id = this.id;
            return el;
        },
    };

    return view;
}
