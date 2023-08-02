// currently, this can only be imported as CJS.
const { getNextFocus } = require('@bbc/tv-lrud-spatial');

import { getLocationHashValue } from './utils/getLocationHashValue';
import { scrollAction } from './libs/deadSea';
import { getDataFromEl } from './utils/getDataFromEl';
import { assertKey } from './utils/keys';
import { AdditionalKeys } from './enums/AdditionalKeys';
import { Direction } from './enums/Direction';
import { throttle } from './utils/throttle';
import { animations } from './config/animations';

/** @type {HTMLElement|undefined} */
let scope = undefined;
/** @type {HTMLElement=} */
let lastFocus;

function clearFocus() {
  // todo: implement me
  console.log('[clearFocus]')
}
/**
 * 
 * @param {HTMLElement} el 
 */
function focus(el) {
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
 * @param {KeyboardEvent} event
 * @param {HTMLElement} toEl 
 * @param {HTMLElement} [fromEl] 
 */
function moveFocus(event, toEl, fromEl) {
  focus(toEl);

  if (fromEl) {
    blur(fromEl);
  } else {
    clearFocus();
  }
  const useTransforms = animations.transforms;
  scrollAction(toEl, event.keyCode, useTransforms);
}


/**
 * 
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

  scrollHierarchy.forEach(function (item) {
    const el = item[0];

    // Check first to avoid triggering unnecessary `scroll` events
    if (typeof(el) !== 'number' && el.scrollLeft != item[1])
      el.scrollLeft = +item[1];

    if (typeof(el) !== 'number' && el.scrollTop != item[2])
      el.scrollTop = +item[2];
  });
};

/**
 * handleKeyDown
 * @param {KeyboardEvent} event 
 */
function handleKeyDown(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (assertKey(event, AdditionalKeys.ENTER)) {
    // early return on `enter` keypress.
    return handleEnter(event);
  }

  if (assertKey(event, AdditionalKeys.BACKSPACE)) {
    // early return on `back` keypress.
    return handleBack(event);
  }

  if (assertKey(event, [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT])) {
    let nextFocus;
    if (event.target === document.body) {
      // we've probably lost focus if this happens
      if (lastFocus instanceof HTMLElement) {
        // if we've stored the last focus, use it
        // lastFocus.focus();
        focus(lastFocus);
        nextFocus = getNextFocus(lastFocus, event.keyCode, scope)
      } else {
        // we have no real starting point, so assume we're starting anew, 
        // like at app start
        nextFocus = getNextFocus();
      }
    } else {
      nextFocus = getNextFocus(/** @type {HTMLElement} */ (event.target), event.keyCode, scope);
    }

    if (nextFocus) {
      moveFocus(event, nextFocus, lastFocus);

      lastFocus = nextFocus;
    }

    return;
  }

  handleOtherKey(event);
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
  if (event.target && event.target instanceof HTMLAnchorElement && event.target.nodeName === 'A') {
    if (getDataFromEl(event.target, 'external')) {
      // it is an external link
      return handleExternal(event.target.href);
    }

    // todo: pointless? `hash` exists on the `a` tag
    const target = getLocationHashValue(event.target.href)

    target && handleNav(target);
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
 * @callback handleKeyDownCallback
 * @param {KeyboardEvent} event
 */

/**
 * @returns {void}
 */
export function initNavigation() {
  // this exists as it is currently because the moment you click
  // anything, the current focus is lost
  // todo: probably need a pause/resume spatial navigation method so
  // you can toggle between pointer and spatial based modalities
  window.addEventListener('click', handleClick);
  window.addEventListener('keydown', (...args) => throttle(handleKeyDown, 60, args));

  const initialFocus = getNextFocus();

  if (initialFocus) {
    focus(initialFocus);
    lastFocus = initialFocus
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

