import { loga } from './utils/loga/loga.js';
import { getPlatform } from './platform.js';
import { diff } from './differenceEngine.js';

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
		preserveAttributes: options.preserveAttributes || [],
		viewEl: null, // Initialize as null, not undefined

		/**
		 * Attaches the view's rendered element to a parent element in the DOM.
		 * It also triggers the `viewDidLoad` lifecycle method if it exists.
		 * @param {Element} parentEl - The parent element to attach to.
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

			const platform = getPlatform();
			// this.viewEl is guaranteed to be an Element here.
			platform.appendChild(parentEl, /** @type {Node} */ (this.viewEl));

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
				const platform = getPlatform();
				platform.removeChild(this.viewEl.parentElement, this.viewEl);
			}

			this.viewEl = null;
		},

		/**
		 * Hydrates the view by attaching its logic to an existing DOM element.
		 * This is used on the client to take over server-rendered HTML.
		 * @param {Element} element The existing DOM element to hydrate.
		 */
		hydrate(element) {
			this.viewEl = element;

			// Immediately run a diff against the server-rendered DOM.
			// This is the core of "hydration": it doesn't re-create the DOM,
			// but it walks the tree and attaches event listeners and other dynamic properties.
			const vdom = this.render();
			diff(vdom, this.viewEl, {
				preserveAttributes: this.preserveAttributes,
			});

			// Safely call viewDidLoad AFTER the diffing process has completed.
			// This ensures the view's logic runs on a fully hydrated DOM, making it
			// consistent with the `attach` lifecycle.
			if (this.viewDidLoad) {
				this.viewDidLoad();
			}
		},

		/**
		 * Renders the view's HTML element.
		 * This method must be implemented by the specific view that extends this base.
		 * @returns {Element}
		 */
		render() {
			// This is a placeholder. The actual view must override this method.
			logr.warn(
				`[render] The 'render' method for view "${this.id}" is not implemented. Returning an empty div.`
			);
			const platform = getPlatform();
			const el = platform.createElement('div');
			el.id = this.id;
			return el;
		},
	};

	return view;
}
