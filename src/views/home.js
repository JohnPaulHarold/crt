/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').PageData} PageData
 */

import { a, div } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';

import { pageData } from '../stubData/pageData';

import { handleKeydownOnElement } from '../utils/dom/handleKeydownOnElement';
import { assertKey } from '../utils/keys';
import { $dataGet } from '../utils/dom/$dataGet';

import { Carousel } from '../components/Carousel';
import { Tile } from '../components/Tile';
import { Spinner } from '../components/Spinner';

import { Orientation } from '../models/Orientation';
import { AdditionalKeys } from '../models/AdditionalKeys';

import { focusInto } from '../navigation';
import { appOutlets } from '../outlets';

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
 */
export class Home extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);
        this.fetchData();
        this.listenForBack();
    }

    /**
     * @name focusPage
     * @param {HTMLElement} el
     */
    focusPage(el) {
        focusInto(el);
    }

    listenForBack() {
        window.addEventListener('keydown', this.handleBack.bind(this));
    }

    /**
     *
     * @param {KeyboardEvent} event
     */
    handleBack(event) {
        if (assertKey(event, AdditionalKeys.BACKSPACE)) {
            const target = event.target;

            if (target instanceof HTMLElement) {
                const nextBack = findNextBackStop(target);

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

    listenToCarousels() {
        if (this.carousels) {
            this.keyHandleCleanup = handleKeydownOnElement(
                this.carousels,
                this.handleKeyboard.bind(this)
            );
        }
    }

    /**
     *
     * @param {KeyboardEvent} event
     */
    handleKeyboard(event) {
        if (
            event.target instanceof HTMLAnchorElement &&
            assertKey(event, AdditionalKeys.ENTER)
        ) {
            const keyPressValue = event.target.href;
            window.location.href = keyPressValue;
        }
    }

    /**
     *
     * @param {PageData} data
     * @returns {HTMLElement}
     */
    buildCarousels(data) {
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

        this.listenToCarousels();

        return this.carousels;
    }

    fetchData() {
        setTimeout(() => {
            this.data = pageData;
            this.updateRender();
        }, 500);

        return;
    }

    /**
     * updateRender
     * @param {HTMLElement} [el]
     */
    updateRender(el) {
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

    render() {
        if (!this.data) {
            return div(
                { className: 'view', id: this.id },
                Spinner({ message: 'Hold on!' })
            );
        }

        return div({ className: 'view', id: this.id });
    }
}
