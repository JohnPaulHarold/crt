/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').PageData} PageData
 */

import { a, div } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';

import { pageData } from '../stubData/pageData';

import { assertKey } from '../utils/keys';
import { $dataGet } from '../utils/dom/$dataGet';

import { Carousel } from '../components/Carousel';
import { Tile } from '../components/Tile';
import { Spinner } from '../components/Spinner';

import { Orientation } from '../models/Orientation';
import { AdditionalKeys } from '../models/AdditionalKeys';

import { focusInto } from '../navigation';
import { appOutlets } from '../outlets';
import { normaliseEventTarget } from '../utils/dom/normaliseEventTarget';

/**
 *
 * @param {HTMLElement|null} el
 * @returns {HTMLElement=}
 */
function findNextBackStop(el) {
    if (!el) {
        return;
    }

    if ($dataGet(el, 'backStop')) {
        const firstChild = el.children[0];

        // if you're already focused on the back-stop of the container
        // keep traversing the tree till you find the next
        if (
            firstChild.classList.contains('focused') ||
            firstChild.querySelector('.focused')
        ) {
            return findNextBackStop(el.parentElement);
        }

        return el;
    }

    return findNextBackStop(el.parentElement);
}

/**
 * @extends BaseView
 * @typedef {BaseView & Home} HomeView
 */

/**
 * constructor
 * @param {ViewOptions} options
 * @this {HomeView}
 */
export function Home(options) {
    BaseView.call(this, options);
    this.fetchData();
}

// inherit from BaseView
Home.prototype = Object.create(BaseView.prototype);
// Set the constructor back
Home.prototype.constructor = Home;

// prototype methods
/**
 * @this {HomeView}
 */
Home.prototype.viewDidLoad = function () {
    this.listenForBack(true);
}

/**
 * @name focusPage
 * @param {HTMLElement} el
 */
Home.prototype.focusPage = function (el) {
    focusInto(el);
}

/**
 * @this {HomeView}
 * @param {boolean} flag
 */
Home.prototype.listenForBack = function (flag) {
    const method = flag 
        ? this.viewEl.addEventListener
        : this.viewEl.removeEventListener;

    method('keydown', this.handleBack.bind(this));
}

/**
 *
 * @param {KeyboardEvent} event
 */
Home.prototype.handleBack = function (event) {
    if (assertKey(event, AdditionalKeys.BACKSPACE)) {
        const elTarget = normaliseEventTarget(event);

        if (elTarget instanceof HTMLElement) {
            const nextBack = findNextBackStop(elTarget);

            if (nextBack) {
                focusInto(nextBack);
            } else {
                // focus into the menu
                const navEl = appOutlets['nav'];
                focusInto(navEl);
            } 
        }
    }
}

/**
 *
 * @param {KeyboardEvent | MouseEvent} event
 */
Home.prototype.handleKeyboard = function (event) {
    const elTarget = normaliseEventTarget(event);
    if (
        elTarget instanceof HTMLAnchorElement &&
        (
            event instanceof MouseEvent ||
            event instanceof KeyboardEvent && assertKey(event, AdditionalKeys.ENTER)
        )
    ) {
        const keyPressValue = elTarget.href;
        window.location.href = keyPressValue;
    }
}

/**
 *
 * @param {PageData} data
 * @returns {HTMLElement}
 */
Home.prototype.buildCarousels = function (data) {
    this.carousels = Carousel(
        {
            id: data.id,
            orientation: Orientation.VERTICAL,
            childQuery: `#${data.id} .home-carousel`,
            blockExit: 'up down right',
            backStop: 'viewStart',
        },
        data.items.map((rail) =>
            Carousel(
                {
                    id: rail.id,
                    title: rail.title,
                    className: 'home-carousel',
                    orientation: Orientation.HORIZONTAL,
                    blockExit: 'right',
                    backStop: 'viewStart',
                },
                rail.items.map((railItem) =>
                    a(
                        {
                            dataset: { external: true },
                            href: railItem.url,
                            id: railItem.id,
                        },
                        Tile(railItem)
                    )
                )
            )
        )
    );

    return this.carousels;
}

/**
 * 
 * @this {HomeView}
 */
Home.prototype.fetchData = function () {
    setTimeout(() => {
        this.data = pageData;
        this.updateRender();
    }, 500);

    return;
}

/**
 * updateRender
 * @param {HTMLElement} [el]
 * @this {HomeView}
 */
Home.prototype.updateRender = function (el) {
    let target = this.viewEl;

    if (el) {
        target = el;
    }

    if (target && this.data) {
        target.innerHTML = '';
        const el = this.buildCarousels(this.data);
        target.appendChild(el);

        this.focusPage(el);
    }
}

/**
 * @this {HomeView}
 * @returns {HTMLElement}
 */
Home.prototype.render = function () {
    if (!this.data) {
        return div(
            { className: 'view', id: this.id },
            Spinner({ message: 'Hold on!' })
        );
    }

    return div({ className: 'view', id: this.id });
}