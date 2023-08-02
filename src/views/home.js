/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 * @typedef {import('../declarations/types').PageData} PageData
 */

import { a, div } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';

import { pageData } from '../stubData/pageData';

import { handleKeydownOnElement } from '../utils/handleKeydownOnElement';
import { assertKey } from '../utils/keys';

import { Carousel } from '../components/Carousel';
import { Tile } from '../components/Tile';

import { Orientation } from '../enums/Orientation';
import { AdditionalKeys } from '../enums/AdditionalKeys';
import { Spinner } from '../components/Spinner';
import { focusInto } from '../navigation';

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
    }

    destructor() {}

    /**
     * 
     * @param {HTMLElement} el 
     */
    focusPage(el) {
        focusInto(el);
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
            },
            data.items.map((rail) =>
                Carousel(
                    {
                        id: rail.id,
                        title: rail.title,
                        className: 'home-carousel',
                        orientation: Orientation.HORIZONTAL,
                        blockExit: 'right',
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
        }, 3000);

        return;
    }

    /**
     * updateRender
     * @param {HTMLElement} [el]
     */
    updateRender(el) {
        let target = document.getElementById(this.id);

        if (el) {
            target = el;
        }

        if (target && this.data) {
            target.innerHTML = '';
            const el = this.buildCarousels(this.data)
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

        return div(
            { className: 'view', id: this.id },
        );
    }
}
