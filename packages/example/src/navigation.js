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

import { animations } from './config/animations.js';
import { scrollAction } from './libs/deadSea.js';
import { PubSub } from './state/PubSub.js';

/** @type {HTMLElement|undefined} */
let _scope = undefined;
/** @type {HTMLElement=} */
let lastFocus;
let _handleKeyDown = handleKeyDown;

/**
 * @param {HTMLElement} [newScope]
 */
export function setLrudScope(newScope) {
    _scope = newScope;
}

/**
 * @returns { {el: HTMLElement, id: string|null} | undefined }
 */
export function getLastFocus() {
    if (!lastFocus) return;

    return {
        el: lastFocus,
        id: lastFocus.getAttribute('id'),
    };
}

/**
 * @description exists in case you need to override the default handling
 * @param {(event: KeyboardEvent) => void} func
 * @returns {() => void}
 */
export function registerCustomFocusHandler(func) {
    _handleKeyDown = func;

    // return function restores the default
    return () => {
        _handleKeyDown = handleKeyDown;
    };
}

export const navigationBus = new PubSub();

/**
 * @param {KeyboardEvent} event
 * @param {HTMLElement} [scope]
 */
export function handleKeyDown(event, scope) {
    event.preventDefault();

    if (scope) {
        _scope = scope;
    }

    if (assertKey(event, AdditionalKeys.ENTER)) {
        // early return on `enter` keypress.
        return handleEnter(event);
    }

    // if (assertKey(event, AdditionalKeys.BACKSPACE)) {
    //     // early return on `back` keypress.
    //     return handleBack(event);
    // }

    if (
        assertKey(event, [
            Direction.UP,
            Direction.DOWN,
            Direction.LEFT,
            Direction.RIGHT,
        ])
    ) {
        let nextFocus;

        // special case for tom
        const elTarget = normaliseEventTarget(event);

        if (elTarget === document.body && lastFocus instanceof HTMLElement) {
            moveFocus(lastFocus);
            nextFocus = getNextFocus(lastFocus, event.keyCode, _scope);
        } else if (elTarget instanceof HTMLElement) {
            nextFocus = getNextFocus(elTarget, event.keyCode, _scope);
        } else {
            // we have no real starting point, so assume we're starting anew,
            // like at app start
            nextFocus = getNextFocus(null, -1);
        }

        if (nextFocus) {
            if (lastFocus) {
                emitMoveEvent(event, lastFocus, nextFocus);
            }

            moveFocus(nextFocus, lastFocus);
            lastFocus = nextFocus;
        }

        return;
    }

    handleOtherKey(event);
}

export const NavigationEvents = {
    MOVE: 'lrud:move',
};

/**
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

function clearFocus() {
    const els = document.querySelectorAll('.focused');
    collectionToArray(els).forEach((/** @type {Element} */ el) =>
        el.classList.remove('focused')
    );
}
/**
 *
 * @param {HTMLElement} el
 */
export function focus(el) {
    el.classList.add('focused');

    focusWithoutScrolling(el);
}

/**
 *
 * @param {HTMLElement} el
 */
function blur(el) {
    el.classList.remove('focused');
    el.blur();
}

/**
 * @param {HTMLElement} toEl
 * @param {HTMLElement} [fromEl]
 */
export function moveFocus(toEl, fromEl) {
    if (fromEl) {
        blur(fromEl);
    } else {
        clearFocus();
    }

    focus(toEl);

    const useTransforms = animations.transforms;
    scrollAction(toEl, useTransforms);
}

/**
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

        // Check first to avoid triggering unnecessary `scroll` events
        if (typeof el !== 'number' && el.scrollLeft != item[1]) {
            el.scrollLeft = +item[1];
        }

        if (typeof el !== 'number' && el.scrollTop != item[2]) {
            el.scrollTop = +item[2];
        }
    });
};

/**
 *
 * @param {HTMLElement} target
 * @returns {HTMLElement[]}
 */
export function getElementContainer(target) {
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
 * handleOtherKey
 * @param {KeyboardEvent} event
 */
function handleOtherKey(event) {
    event.preventDefault();
}

/**
 * handleEnter
 * @param {KeyboardEvent} event
 */
function handleEnter(event) {
    event.preventDefault();

    const elTarget = normaliseEventTarget(event);

    // special routine for actual a tags with urls
    if (
        elTarget &&
        elTarget instanceof HTMLAnchorElement &&
        elTarget.nodeName === 'A'
    ) {
        if ($dataGet(elTarget, 'external')) {
            // it is an external link
            return handleExternal(elTarget.href);
        }

        elTarget.hash && handleNav(elTarget.hash);
    }
}

/**
 * This callback is displayed as a global member.
 * @returns {void}
 */
export function initNavigation() {
    // this exists as it is currently because the moment you click
    // anything, the current focus is lost
    // todo: probably need a pause/resume spatial navigation method so
    // you can toggle between pointer and spatial based modalities

    // window.addEventListener('click', handleClick);

    window.addEventListener('keydown', (...args) => {
        throttle(_handleKeyDown, 60, args);
    });

    const initialFocus = getNextFocus(null, -1);

    if (initialFocus) {
        moveFocus(initialFocus);
        lastFocus = initialFocus;
    }
}

/**
 * handleNav
 * @param {string} hash
 */
export function handleNav(hash) {
    window.location.hash = hash;
}

/**
 * handleExternal
 * @param {string} href
 */
export function handleExternal(href) {
    window.location.href = href;
}

/**
 * @param {HTMLElement} scopeEl
 */
export function focusInto(scopeEl) {
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

            moveFocus(nextFocus);
            lastFocus = nextFocus;
        }
    }
}

/**
 * @param {string} id DOM element id
 */
export function isElementFocused(id) {
    const focusableEl = document.getElementById(id);

    if (focusableEl && focusableEl.classList.contains('focused')) {
        return true;
    }

    return false;
}

export function getCurrentFocus() {
    const focusableEl = document.querySelector('.focused');

    if (!focusableEl) return;

    if (focusableEl) {
        return {
            el: focusableEl,
            id: focusableEl.getAttribute('id'),
        };
    }
}
