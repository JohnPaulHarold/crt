/**
 * @typedef {import('../declarations/types').ViewOptions} ViewOptions
 */
import { a, div, h1, p } from '../libs/makeElement';
import { BaseView } from '../libs/baseView';
import { checkImages } from '../libs/indolence';

import { LazyImage } from '../components/LazyImage';
import { Grid } from '../components/Grid';
import { Button } from '../components/Button';
import { Carousel } from '../components/Carousel';

import { Orientation } from '../enums/Orientation';

import Logo from '../assets/Public_Domain_Mark_button.svg.png';

import { showData } from '../stubData/showData';

import s from './show.css';
import { handleKeyDown, registerCustomFocusHandler } from '../navigation';
import { assertKey } from '../utils/keys';
import { Direction } from '../enums/Direction';

/**
 * @extends BaseView
 */
export class Show extends BaseView {
    /**
     * @param {ViewOptions} options
     */
    constructor(options) {
        super(options);

        this.info = options.params;
        this.search = options.search;

        // whether we are focused on the bottom rails or not
        // if we're not, we want to show the description, buttons
        // if we are then we hide them
        this.belowFold = false;

        this.showName =
            this.search.name && typeof this.search.name === 'string'
                ? decodeURI(this.search.name)
                : '';

        this.bleedImage = LazyImage({
            className: s.showBleedImage,
            src:
                'https://picsum.photos/seed/' +
                decodeURI(this.showName).replace(' ', '') +
                '/1280/720',
        });

        registerCustomFocusHandler(this.customHandleKeyDown.bind(this));
    }

    fetchData() {}

    animateFold() {
        const logoEl = document.querySelector(`.${s.showLogo}`);
        const overlayEl = document.querySelector(`.${s.showOverlay}`);

        if (!this.belowFold) {
            if (overlayEl instanceof HTMLElement) {
                overlayEl.style.opacity = "0";
            }
            if (logoEl instanceof HTMLElement) {
                logoEl.style.opacity = "0.5";
            }
        } else {
            if (overlayEl instanceof HTMLElement) {
                overlayEl.style.opacity = "1";
            }
            if (logoEl instanceof HTMLElement) {
                logoEl.style.opacity = "1";
            }
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    customHandleKeyDown(event) {
        console.log(`[${this.id}][customHandleKeyDown]`, event, this.belowFold);
        console.log(`[${this.id}][customHandleKeyDown]`, this.belowFold);

        const navEl =
            event.target &&
            event.target instanceof HTMLElement &&
            event.target.id.match(/nav/);
        const isUpOrDown = assertKey(event, [Direction.UP, Direction.DOWN]);


        if (isUpOrDown && this.scope && !navEl) {
            this.animateFold();
            handleKeyDown(event, this.scope);
            this.belowFold = !this.belowFold;
            // we will also need to load any images
            // this is horrible, and it would be much, much, much better to 
            // use IntersectionObserver
            this.scope && checkImages(this.scope, 200);
        } else {
            handleKeyDown(event);
        }
    }

    viewDidLoad() {
        this.scope = document.getElementById(this.id);
        this.scope && checkImages(this.scope);
    }

    render() {
        return div(
            { className: 'view', id: this.id },
            // full bleed image
            this.bleedImage,
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
                        h1({ className: s.showTitle }, 'Show ' + this.showName),
                        p(
                            { className: s.showDescription },
                            showData.description
                        ),
                        div(
                            { className: s.buttonRow + ' lrud-container' },
                            Button({ id: 'play', text: 'PLAY' }),
                            Button({ id: 'play-trailer', text: 'TRAILER' })
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
    }
}
