# crt

A simple single page app. Very old school, for very old school TV devices. This exists because of past experiences working with low spec set top boxes, old TVs etc, and trying to figure out how to make TV apps that aren't consuming too much memory.

It is currently only concerning itself with UI constructs, players are a whole other bag of cats. There are several screens (views) in the app, but they are mostly serving as experiments for particular concepts, such DOM diffing, forms, virtual lists etc.

## tech

This repo is trying to be light with regards JavaScript, so with that in mind it's deliberatly old fashioned looking in places. The thinking is that if you're writing code for devices that are 8+ years old using browser tech that might be even older, perhaps also write in idioms contemporary to it. Until the hardware landscape changes and progresses, most of the code is written like it's ES5, with some occasional ES6 thrown in and a light Babel pass at the end. This is normally the point where most developers jump ship.

## research

I'm interested in offloading work to threads, and what difference this can make in real terms: offloading XHRs, IndexedDB, "more". Some initial research has been done in this area.

I'm also interested in moving DOM construction to the server where possible, trying to make the device do as little work as possible. This is ongoing research.

Other aspects I'm looking at:

- DOM diffing
- [a11y](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## styles

For now, [sass](https://sass-lang.com/) is used. This is primarily for a few reasons:

- variables
- a helpful pixels to rem function

CSS Variables are a thing, but the scope of the project is for devices with technology prior to that standard becoming widespread. Like most of the rest of the choices, it will be subject to review as the baseline of technology moves upwards. I also wasn't keen on the polyfills, but that could also change.

Another point to note is how styling is done. In your `.sass` file you will define your dimensions in a pixel size from a 1080p design. The `px-to-rem()` function will then translate that to `.rem` for you.

## name

`crt` stands for [Cathode-ray Tube](https://en.wikipedia.org/wiki/Cathode-ray_tube). An old television technology. It seemed fitting.

## commands

`npm run dev`

spins up a simple dev-server, watching for changes

`npm run build`

builds the app, outputting to `/dist`

`npm run typecheck`

checks types. Note: types are currently expressed as JSDoc types

`npm run lint:js`

runs eslint on `src/`. Currently this script is informative only, and does not block builds, or commits.

`npm run lint:prettier`

does a [`prettier`](https://prettier.io/) pass, writing the changes.

`npm run test`

runs through tests, watching by default. This command uses [Vitest](https://vitest.dev/).

`npm run coverage`

creates a code coverage report. Currently found in `/coverage/index.html`

## License

`crt` is copyright (c) 2021-present John-Paul Harold <johnpaul.harold@gmail.com> and the contributors.

`crt` is free software, licensed under the Apache License, Version 2.0. See the
[`LICENSE`](LICENSE) file for more details.
