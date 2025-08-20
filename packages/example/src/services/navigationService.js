import { getNextFocus } from '@bbc/tv-lrud-spatial';

import {
    $dataGet,
    $dataSet,
    assertKey,
    getDirectionFromKeyCode,
    throttle,
    collectionToArray,
    normaliseEventTarget,
    AdditionalKeys,
    Direction,
} from 'crt';

import { animations } from '../config/animations.js';
import { scrollAction } from '../libs/deadSea.js';
import { pubSub } from '../state/PubSub.js';

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
 */

/**
 * Creates a singleton service to manage all spatial navigation logic.
 * @returns {NavigationServiceInstance} The navigation service instance.
 */
function createNavigationService() {
    /** @type {HTMLElement|undefined} */
    let _scope = undefined;
    /** @type {HTMLElement|undefined} */
    let _lastFocus;

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
                (a instanceof HTMLElement &&
                    a.classList.contains('lrud-container'))
            ) {
                els.unshift(a);
                break;
            }
        }

        return els;
    }

    /**
     * Handles the 'Enter' key press.
     * @private
     * @param {KeyboardEvent} event
     */
    function handleEnter(event) {
        event.preventDefault();
        const elTarget = normaliseEventTarget(event);

        if (
            elTarget &&
            elTarget instanceof HTMLAnchorElement &&
            elTarget.nodeName === 'A'
        ) {
            if ($dataGet(elTarget, 'external')) {
                window.location.href = elTarget.href;
            } else if (elTarget.hash) {
                window.location.hash = elTarget.hash;
            }
        }
    }

    /**
     * The default keydown handler for spatial navigation.
     * @private
     * @param {KeyboardEvent} event
     * @param {HTMLElement} [scope]
     */
    function handleKeyDown(event, scope) {
        event.preventDefault();

        if (scope) {
            _scope = scope;
        }

        if (assertKey(event, AdditionalKeys.ENTER)) {
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
            let nextFocus;
            const elTarget = normaliseEventTarget(event);

            if (
                elTarget === document.body &&
                _lastFocus instanceof HTMLElement
            ) {
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
                service.moveFocus(nextFocus, _lastFocus);
                _lastFocus = nextFocus;
            }
        }
    }

    /** @type {NavigationServiceInstance} */
    const service = {
        /**
         * Initializes the navigation service by setting up global listeners.
         */
        init() {
            window.addEventListener('keydown', (...args) => {
                throttle(_handleKeyDown, 60, args);
            });

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
            if (fromEl) {
                blur(fromEl);
            } else {
                clearFocus();
            }

            focus(toEl);

            const useTransforms = animations.transforms;
            scrollAction(toEl, useTransforms);
        },

        /**
         * Finds the first focusable element within a given scope and focuses it.
         * @param {HTMLElement} scopeEl
         */
        focusInto(scopeEl) {
            if (scopeEl instanceof HTMLElement) {
                const nextFocus = getNextFocus(null, -1, scopeEl);

                if (nextFocus) {
                    if (nextFocus.id) {
                        const containers = getElementContainer(nextFocus);
                        const container = containers[0];

                        if ($dataGet(container, 'focus')) {
                            $dataSet(container, 'focus', nextFocus.id);
                        }
                    }

                    this.moveFocus(nextFocus);
                    _lastFocus = nextFocus;
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
    };

    return service;
}

/** @type {NavigationServiceInstance} */
export const navigationService = createNavigationService();
