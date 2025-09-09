import { getNextFocus } from '@bbc/tv-lrud-spatial';

import {
	$dataGet,
	$dataSet,
	assertKey,
	getDirectionFromKeyCode,
	createThrottle,
	collectionToArray,
	normaliseEventTarget,
	AdditionalKeys,
	Direction,
} from 'crt';

import { animations } from '../config/animations.js';
import { deadSeaService } from '../libs/deadSea.js';
import { pubSub } from '../state/PubSub.js';
import { speechService } from './speechService.js';

export const NavigationEvents = {
	MOVE: 'lrud:move',
};

/**
 * @typedef {import('../state/PubSub.js').PubSubInstance} PubSubInstance
 */

/**
 * @typedef {object} NavigationServiceInstance
 * @property {() => void} init - Initializes the service and sets up global listeners.
 * @property {(newScope?: HTMLElement) => void} setScope - Sets the current focus scope for LRUD navigation.
 * @property {() => {el: HTMLElement, id: string|null} | undefined} getLastFocus - Gets the last focused element.
 * @property {(customHandler: (event: KeyboardEvent, defaultHandler: (event: KeyboardEvent, scope?: HTMLElement) => void) => void) => () => void} registerCustomFocusHandler - Temporarily overrides the default keydown handler.
 * @property {(toEl: HTMLElement, fromEl?: HTMLElement) => void} moveFocus - Moves focus from one element to another.
 * @property {(scopeEl: HTMLElement) => void} focusInto - Finds and focuses the first focusable element within a scope.
 * @property {(id: string) => boolean} isElementFocused - Checks if an element with a given ID is currently focused.
 * @property {() => {el: Element, id: string|null} | undefined} getCurrentFocus - Gets the currently focused element.
 * @property {() => PubSubInstance} getBus - Returns the internal event bus instance.
 * @property {() => void} [_resetForTesting] - Clears state for test isolation.
 */

/**
 * Creates a singleton service to manage all spatial navigation logic.
 * @returns {NavigationServiceInstance} The navigation service instance.
 */
function createNavigationService() {
	/** @type {HTMLElement|undefined} */
	let _scope = undefined;
	/** @type {HTMLElement|undefined} */
	let _lastFocus = undefined;

	const navigationBus = pubSub;

	// The default key handler, which can be temporarily overridden.
	let _handleKeyDown = handleKeyDown;

	/**
	 * Emits a move event on the navigation bus.
	 * @private
	 * @param {KeyboardEvent} event
	 * @param {HTMLElement} last
	 * @param {HTMLElement} next
	 */
	function emitMoveEvent(event, last, next) {
		const direction = getDirectionFromKeyCode(event.keyCode);
		const [lastC] = getElementContainer(last);
		const [nextC] = getElementContainer(next);

		navigationBus.emit(NavigationEvents.MOVE, {
			type: NavigationEvents.MOVE,
			detail: {
				direction,
				lastElement: last,
				nextElement: next,
				lastContainer: lastC,
				nextContainer: nextC,
			},
		});
	}

	/**
	 * Removes the 'focused' class from all elements in the document.
	 * @private
	 */
	function clearFocus() {
		const els = document.querySelectorAll('.focused');
		collectionToArray(els).forEach((/** @type {Element} */ el) =>
			el.classList.remove('focused')
		);
	}

	/**
	 * Focuses an element without causing the page to scroll.
	 * @private
	 * @param {HTMLElement} el
	 * @see {@link https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling}
	 */
	const focusWithoutScrolling = function (el) {
		const scrollHierarchy = [];
		let parent = el.parentElement;

		while (parent) {
			scrollHierarchy.push([parent, parent.scrollLeft, parent.scrollTop]);
			parent = parent.parentElement;
		}

		el.focus();

		scrollHierarchy.forEach((item) => {
			const el = item[0];
			if (typeof el !== 'number' && el.scrollLeft != item[1]) {
				el.scrollLeft = +item[1];
			}
			if (typeof el !== 'number' && el.scrollTop != item[2]) {
				el.scrollTop = +item[2];
			}
		});
	};

	/**
	 * Applies focus styling to an element.
	 * @private
	 * @param {HTMLElement} el
	 */
	function focus(el) {
		el.classList.add('focused');
		focusWithoutScrolling(el);
	}

	/**
	 * Removes focus styling from an element.
	 * @private
	 * @param {HTMLElement} el
	 */
	function blur(el) {
		el.classList.remove('focused');
		el.blur();
	}

	/**
	 * Finds the closest focusable container for a given element.
	 * @private
	 * @param {HTMLElement} target
	 * @returns {HTMLElement[]}
	 */
	function getElementContainer(target) {
		let a = target;
		const els = [];

		while (target && a && a.parentElement) {
			els.unshift(a);
			a = a.parentElement;
			if (
				a.nodeName === 'SECTION' ||
				a.nodeName === 'NAV' ||
				(a instanceof HTMLElement && a.classList.contains('lrud-container'))
			) {
				els.unshift(a);
				break;
			}
		}

		return els;
	}

	/**
	 * Finds the initial element to focus within a container.
	 * It prioritizes an element specified by a 'data-focus' attribute
	 * and falls back to the first focusable element.
	 * @private
	 * @param {HTMLElement} containerEl
	 * @returns {HTMLElement | null}
	 */
	function _getInitialFocusInContainer(containerEl) {
		const lastFocusedId = $dataGet(containerEl, 'focus');
		if (lastFocusedId && typeof lastFocusedId === 'string') {
			// Query within the container for the element with the stored ID.
			const lastFocusedEl = containerEl.querySelector('#' + lastFocusedId);
			if (lastFocusedEl instanceof HTMLElement) {
				return lastFocusedEl;
			}
		}

		// Fallback: get the first focusable element in the container.
		// getNextFocus with a null `from` element gets the first focusable.
		return getNextFocus(null, -1, containerEl);
	}

	/**
	 * Handles the 'Enter' key press.
	 * @private
	 * @param {KeyboardEvent} event
	 */
	function handleEnter(event) {
		const elTarget = normaliseEventTarget(event);

		if (elTarget && elTarget instanceof HTMLElement) {
			// If it's an anchor, decide whether to navigate or to treat it as a click.
			if (elTarget instanceof HTMLAnchorElement) {
				// If it has a meaningful hash for routing, or is an external link, navigate.
				if (
					$dataGet(elTarget, 'external') ||
					(elTarget.hash && elTarget.hash.length > 1)
				) {
					if ($dataGet(elTarget, 'external')) {
						window.location.href = elTarget.href;
					} else {
						window.location.hash = elTarget.hash;
					}
					return; // Navigation handled, we're done.
				}
			}

			// For all other elements (buttons, or anchors not used for navigation),
			// dispatch a click event to unify keyboard and pointer interaction.
			elTarget.click();
		}
	}

	/**
	 * The default keydown handler for spatial navigation.
	 * @private
	 * @param {KeyboardEvent} event
	 * @param {HTMLElement} [scope]
	 */
	function handleKeyDown(event, scope) {
		if (scope) {
			_scope = scope;
		}

		if (assertKey(event, AdditionalKeys.ENTER)) {
			// Prevent the browser's default action for Enter (e.g., following a link).
			event.preventDefault();

			return handleEnter(event);
		}

		if (
			assertKey(event, [
				Direction.UP,
				Direction.DOWN,
				Direction.LEFT,
				Direction.RIGHT,
			])
		) {
			// Prevent the browser's default action for arrow keys (e.g., scrolling).
			event.preventDefault();

			let nextFocus;
			const elTarget = normaliseEventTarget(event);

			if (elTarget === document.body && _lastFocus instanceof HTMLElement) {
				focus(_lastFocus);
				nextFocus = getNextFocus(_lastFocus, event.keyCode, _scope);
			} else if (elTarget instanceof HTMLElement) {
				nextFocus = getNextFocus(elTarget, event.keyCode, _scope);
			} else {
				nextFocus = getNextFocus(null, -1);
			}

			if (nextFocus) {
				if (_lastFocus) {
					emitMoveEvent(event, _lastFocus, nextFocus);
				}
				// moveFocus will now handle blurring the last focused element and updating the state.
				service.moveFocus(nextFocus);
			}
		}
	}

	/**
	 * Determines the accessible name of a container element (e.g., a carousel).
	 * @private
	 * @param {HTMLElement} containerEl
	 * @returns {string}
	 */
	function getContainerName(containerEl) {
		const labelledby = containerEl.getAttribute('aria-labelledby');
		if (labelledby) {
			const labelEl = document.getElementById(labelledby);
			if (labelEl) {
				return (labelEl.textContent || '').trim();
			}
		}
		return '';
	}

	/**
	 * Determines the accessible name of a focusable item, including positional info.
	 * @private
	 * @param {HTMLElement} itemEl
	 * @returns {string}
	 */
	function getItemName(itemEl) {
		// Prefer an explicit aria-label if one is provided.
		const ariaLabel = itemEl.getAttribute('aria-label');
		if (ariaLabel) {
			return ariaLabel;
		}

		// Otherwise, construct the name from its text content and positional data.
		let baseName = (itemEl.textContent || '').trim();

		if (itemEl.dataset.totalItems && itemEl.dataset.itemIndex) {
			const total = itemEl.dataset.totalItems;
			const index = itemEl.dataset.itemIndex;
			// Append positional info, e.g., "My Tile, 1 of 8"
			if (baseName) {
				baseName = `${baseName}, ${index} of ${total}`;
			} else {
				// If there's no text, just announce the position.
				baseName = `Item ${index} of ${total}`;
			}
		}

		return baseName;
	}

	/** @type {NavigationServiceInstance} */
	const service = {
		/**
		 * Initializes the navigation service by setting up global listeners.
		 */
		init() {
			// This intermediate function ensures that we always call the *current*
			// value of `_handleKeyDown`, which can be swapped out by the
			// custom focus handler.
			const handler = (/** @type {KeyboardEvent} */ event) =>
				_handleKeyDown(event);
			window.addEventListener('keydown', handler);

			const initialFocus = getNextFocus(null, -1);

			if (initialFocus) {
				this.moveFocus(initialFocus);
				_lastFocus = initialFocus;
			}
		},

		/**
		 * Sets the current focus scope for LRUD navigation.
		 * @param {HTMLElement} [newScope]
		 */
		setScope(newScope) {
			_scope = newScope;
		},

		/**
		 * Gets the last focused element.
		 * @returns {{el: HTMLElement, id: string|null} | undefined}
		 */
		getLastFocus() {
			if (!_lastFocus) return;
			return {
				el: _lastFocus,
				id: _lastFocus.getAttribute('id'),
			};
		},

		/**
		 * Temporarily overrides the default keydown handler with a custom one.
		 * @param {(event: KeyboardEvent, defaultHandler: (event: KeyboardEvent, scope?: HTMLElement) => void) => void} customHandler
		 * @returns {() => void} A function to restore the default handler.
		 */
		registerCustomFocusHandler(customHandler) {
			_handleKeyDown = (event) => customHandler(event, handleKeyDown);
			return () => {
				_handleKeyDown = handleKeyDown;
			};
		},

		/**
		 * Moves focus from one element to another, handling blur/focus and scrolling.
		 * @param {HTMLElement} toEl
		 * @param {HTMLElement} [fromEl]
		 */
		moveFocus(toEl, fromEl) {
			const elementToBlur = fromEl || _lastFocus;

			// 1. Handle blurring the old element
			if (elementToBlur) {
				blur(elementToBlur);
			} else {
				clearFocus();
			}

			// 2. Determine the actual element to focus. If `toEl` is a container,
			// we need to find the first focusable child inside it.
			let actualToEl = toEl;
			if (toEl.matches('nav, section, .lrud-container')) {
				const firstFocusableChild = _getInitialFocusInContainer(toEl);
				if (firstFocusableChild) {
					actualToEl = firstFocusableChild;
				} else {
					// This is a fallback, but a container should ideally always have focusable children.
					console.warn(
						`[navigationService] LRUD container ${toEl.id || toEl.tagName} has no focusable children. Focusing container itself.`
					);
				}
			}

			// 3. Focus the determined element
			focus(actualToEl);

			// Update the internal state to track the newly focused element.
			_lastFocus = actualToEl;

			// 4. Announce the move for accessibility
			const [toContainer] = getElementContainer(actualToEl);
			const [fromContainer] = fromEl
				? getElementContainer(fromEl)
				: [undefined];

			let announcement = '';
			if (toContainer && toContainer !== fromContainer) {
				const containerName = getContainerName(toContainer);
				if (containerName) {
					announcement = containerName;
				}
			}
			const itemName = getItemName(actualToEl);
			if (announcement && itemName) {
				announcement += `. ${itemName}`;
			} else {
				announcement = announcement || itemName;
			}
			speechService.speak(announcement);

			// 5. Trigger the scroll action
			const useTransforms = animations.transforms;
			deadSeaService.scrollAction(actualToEl, useTransforms);
		},

		/**
		 * Finds the first focusable element within a given scope and focuses it.
		 * @param {HTMLElement} scopeEl
		 */
		focusInto(scopeEl) {
			if (scopeEl instanceof HTMLElement) {
				const nextFocus = _getInitialFocusInContainer(scopeEl);

				if (nextFocus) {
					this.moveFocus(nextFocus);
				}
			}
		},

		/**
		 * Checks if an element with a given ID is currently focused.
		 * @param {string} id
		 * @returns {boolean}
		 */
		isElementFocused(id) {
			const focusableEl = document.getElementById(id);
			return !!(focusableEl && focusableEl.classList.contains('focused'));
		},

		/**
		 * Gets the currently focused element in the document.
		 * @returns {{el: Element, id: string|null} | undefined}
		 */
		getCurrentFocus() {
			const focusableEl = document.querySelector('.focused');
			if (focusableEl) {
				return {
					el: focusableEl,
					id: focusableEl.getAttribute('id'),
				};
			}
		},

		/**
		 * Returns the internal event bus instance.
		 * @returns {PubSubInstance}
		 */
		getBus() {
			return navigationBus;
		},

		/**
		 * Clears state and listeners for test isolation.
		 */
		_resetForTesting() {
			// In a real app, you might want to remove the listener, but for testing, re-init is often sufficient.
			_scope = undefined;
			_lastFocus = undefined;
			_handleKeyDown = handleKeyDown;
			if (navigationBus._resetForTesting) {
				navigationBus._resetForTesting();
			}
		},
	};

	return service;
}

/** @type {NavigationServiceInstance} */
export const navigationService = createNavigationService();
