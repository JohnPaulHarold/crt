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

import { handleKeyDown, registerCustomFocusHandler } from '../navigation.js';

import { showData } from '../stubData/showData.js';

import Logo from '../assets/Public_Domain_Mark_button.svg.png';

import s from './show.scss';

/**
 * @param {import('crt/types').ViewOptions} options
 * @returns {import('crt/types').BaseViewInstance}
 */
export function createShowView(options) {
    const base = createBaseView(options);

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

        destructor: function () {
            if (this.customKeyDownHandlerCleanup) {
                this.customKeyDownHandlerCleanup();
            }
        },

        viewDidLoad: function () {
            if (this.viewEl) {
                checkImages(this.viewEl);
            }
            this.customKeyDownHandlerCleanup = registerCustomFocusHandler(
                this.customHandleKeyDown.bind(this)
            );
        },

        animateFold: function () {
            const logoEl = document.querySelector(`.${s.showLogo}`);
            const overlayEl = document.querySelector(`.${s.showOverlay}`);

            if (!this.belowFold) {
                if (overlayEl instanceof HTMLElement) {
                    overlayEl.style.opacity = '0';
                }
                if (logoEl instanceof HTMLElement) {
                    logoEl.style.opacity = '0.5';
                }
            } else {
                if (overlayEl instanceof HTMLElement) {
                    overlayEl.style.opacity = '1';
                }
                if (logoEl instanceof HTMLElement) {
                    logoEl.style.opacity = '1';
                }
            }
        },

        customHandleKeyDown: function (event) {
            const elTarget = normaliseEventTarget(event);
            const navEl =
                elTarget &&
                elTarget instanceof HTMLElement &&
                elTarget.id.match(/nav/);
            const isUpOrDown = assertKey(event, [Direction.UP, Direction.DOWN]);

            if (isUpOrDown && this.viewEl && !navEl) {
                this.animateFold();
                handleKeyDown(event, this.viewEl);
                this.belowFold = !this.belowFold;
                // we will also need to load any images
                // this is horrible, and it would be much, much, much better to
                // use IntersectionObserver
                checkImages(this.viewEl, 200);
            } else {
                handleKeyDown(event);
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
