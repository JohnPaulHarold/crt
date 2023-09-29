import { getNextFocus } from '@bbc/tv-lrud-spatial';

import { scrollAction } from './libs/deadSea';
import { $dataGet } from './utils/dom/$dataGet';
import { assertKey } from './utils/keys';
import { AdditionalKeys } from './models/AdditionalKeys';
import { Direction } from './models/Direction';
import { throttle } from './utils/function/throttle';
import { animations } from './config/animations';
import { collectionToArray } from './utils/dom/collectionToArray';
import { PubSub } from './state/PubSub';

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
 * @name getLastFocus
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
 * @name registerCustomFocusHandler
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
 * @name handleKeyDown
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

    if (assertKey(event, AdditionalKeys.BACKSPACE)) {
        // early return on `back` keypress.
        return handleBack(event);
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

        if (
            event.target === document.body &&
            lastFocus instanceof HTMLElement
        ) {
            moveFocus(lastFocus);
            nextFocus = getNextFocus(lastFocus, event.keyCode, _scope);
        } else if (event.target instanceof HTMLElement) {
            nextFocus = getNextFocus(event.target, event.keyCode, _scope);
        } else {
            // we have no real starting point, so assume we're starting anew,
            // like at app start
            nextFocus = getNextFocus();
        }

        if (nextFocus) {
            if (lastFocus) {
                emitMoveEvent(lastFocus, nextFocus);
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
 *
 * @param {HTMLElement} last
 * @param {HTMLElement} next
 */
function emitMoveEvent(last, next) {
    const [lastC] = getElementContainer(last);
    const [nextC] = getElementContainer(next);

    navigationBus.emit(NavigationEvents.MOVE, {
        type: NavigationEvents.MOVE,
        detail: {
            lastElement: last,
            nextElement: next,
            lastContainer: lastC,
            nextContainer: nextC,
        },
    });
}

function clearFocus() {
    const els = document.querySelectorAll('.focused');
    collectionToArray(els).forEach((el) => el.classList.remove('focused'));
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
 * @name focusWithoutScrolling
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
 * handleOtherKey
 * @param {KeyboardEvent} event
 */
function handleOtherKey(event) {
    event.preventDefault();
}

/**
 * handleBack
 * @param {KeyboardEvent} event
 */
function handleBack(event) {
    event.preventDefault();
}

/**
 * handleEnter
 * @param {KeyboardEvent} event
 */
function handleEnter(event) {
    event.preventDefault();

    if (
        event.target &&
        event.target instanceof HTMLAnchorElement &&
        event.target.nodeName === 'A'
    ) {
        if ($dataGet(event.target, 'external')) {
            // it is an external link
            return handleExternal(event.target.href);
        }

        event.target.hash && handleNav(event.target.hash);
    }
}

/**
 * handleClick
 * @param {MouseEvent} event
 */
function handleClick(event) {
    event.preventDefault();
    // log it out while we figure out what to do
    console.log('[navigation][handleClick] ');
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
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', (...args) =>
        throttle(_handleKeyDown, 60, args)
    );

    const initialFocus = getNextFocus();

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
 * @name focusInto
 * @param {HTMLElement} scopeEl
 */
export function focusInto(scopeEl) {
    if (scopeEl instanceof HTMLElement) {
        const nextFocus = getNextFocus(undefined, undefined, scopeEl);

        if (nextFocus) {
            moveFocus(nextFocus);
            lastFocus = nextFocus;
        }
    }
}

/**
 * @name isElementFocused
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
