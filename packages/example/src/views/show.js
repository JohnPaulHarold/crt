import {
    assertKey,
    normaliseEventTarget,
    Orientation,
    Direction,
    createBaseView,
} from 'crt';
import { checkImages } from '../libs/indolence.js';

import { a, div, p } from '../h.js';

import { LazyImage } from '../components/LazyImage.js';
import { Grid } from '../components/Grid.js';
import { Button } from '../components/Button.js';
import { Carousel } from '../components/Carousel.js';
import { Heading } from '../components/Heading.js';

import { navigationService } from '../services/navigationService.js';
import { appOutlets } from '../outlets.js';

import { showData } from '../stubData/showData.js';

import Logo from '../assets/Public_Domain_Mark_button.svg.png';

import s from './show.scss';

/**
 * @typedef {import('crt').BaseViewInstance & {
 *  info: Record<string, any> | undefined,
 *  search: Record<string, any> | undefined,
 *  belowFold: boolean,
 *  showName: string,
 *  customKeyDownHandlerCleanup: (() => void) | null,
 *  logoEl: Element | null,
 *  overlayEl: Element | null,
 *  destructor: () => void,
 *  viewDidLoad: () => void,
 *  animateFold: () => void,
 *  customHandleKeyDown: (
 *      event: KeyboardEvent,
 *      defaultKeyDownHandler: (event: KeyboardEvent, scope?: HTMLElement) => void
 *  ) => void,
 *  render: () => HTMLElement
 * }} ShowViewInstance
 */

/**
 * @param {import('../index.js').AppViewOptions} options
 * @returns {ShowViewInstance}
 */
export function createShowView(options) {
    const base = createBaseView(options);

    /** @type {ShowViewInstance} */
    const showView = {
        ...base,
        info: options.params,
        search: options.search,
        // whether we are focused on the bottom rails or not
        // if we're not, we want to show the description, buttons
        // if we are then we hide them
        belowFold: false,
        showName: '',
        customKeyDownHandlerCleanup: null,
        logoEl: null,
        overlayEl: null,

        destructor: function () {
            if (this.customKeyDownHandlerCleanup) {
                this.customKeyDownHandlerCleanup();
            }
        },

        viewDidLoad: function () {
            if (this.viewEl) {
                checkImages(this.viewEl);
                this.logoEl = this.viewEl.querySelector(`.${s.showLogo}`);
                this.overlayEl = this.viewEl.querySelector(`.${s.showOverlay}`);
            }
            this.customKeyDownHandlerCleanup =
                navigationService.registerCustomFocusHandler(
                    this.customHandleKeyDown.bind(this)
                );
        },

        animateFold: function () {
            if (!this.belowFold) {
                if (this.overlayEl instanceof HTMLElement) {
                    this.overlayEl.style.opacity = '0';
                }
                if (this.logoEl instanceof HTMLElement) {
                    this.logoEl.style.opacity = '0.5';
                }
            } else {
                if (this.overlayEl instanceof HTMLElement) {
                    this.overlayEl.style.opacity = '1';
                }
                if (this.logoEl instanceof HTMLElement) {
                    this.logoEl.style.opacity = '1';
                }
            }
        },

        customHandleKeyDown: function (event, defaultKeyDownHandler) {
            const elTarget = normaliseEventTarget(event);
            const onNav =
                elTarget &&
                elTarget instanceof HTMLElement &&
                appOutlets.nav &&
                appOutlets.nav.contains(elTarget);
            const isUpOrDown = assertKey(event, [Direction.UP, Direction.DOWN]);

            if (isUpOrDown && this.viewEl && !onNav) {
                this.animateFold();
                defaultKeyDownHandler(event, this.viewEl);
                this.belowFold = !this.belowFold;
                // we will also need to load any images
                // this is horrible, and it would be much, much, much better to
                // use IntersectionObserver
                checkImages(this.viewEl, 200);
            } else {
                defaultKeyDownHandler(event);
            }
        },

        render: function () {
            if (
                this.search &&
                this.search.name &&
                typeof this.search.name === 'string'
            ) {
                this.showName = decodeURI(this.search.name);
            }

            const bleedImage = LazyImage({
                className: s.showBleedImage,
                src:
                    'https://picsum.photos/seed/' +
                    this.showName.replace(' ', '') +
                    '/1280/720',
            });

            return div(
                { className: 'view', id: this.id },
                // full bleed image
                bleedImage,
                LazyImage({ src: Logo, className: s.showLogo }),
                Carousel(
                    {
                        id: 'showCarousel',
                        orientation: Orientation.VERTICAL,
                        childQuery: `.${s.showOverlay}, .${s.suggestions}`,
                        blockExit: 'up right down',
                    },
                    [
                        div(
                            { className: s.showOverlay },
                            Heading(
                                { level: 'h1', className: s.showTitle },
                                'Show ' + this.showName
                            ),
                            p(
                                { className: s.showDescription },
                                showData.description
                            ),
                            div(
                                { className: s.buttonRow + ' lrud-container' },
                                Button({ id: 'play' }, 'PLAY'),
                                Button({ id: 'play-trailer' }, 'TRAILER')
                            )
                        ),
                        Grid(
                            { className: s.suggestions, columns: 4 },
                            showData.related.suggestions.map((suggestion) =>
                                a(
                                    { id: suggestion.id },
                                    LazyImage({
                                        id: suggestion.id,
                                        src: suggestion.imageUrl,
                                    })
                                )
                            )
                        ),
                    ]
                )
            );
        },
    };

    return showView;
}
