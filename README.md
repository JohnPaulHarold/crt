# crt

A monorepo containing the `crt` UI library and an example application. `crt` is designed for building simple, memory-efficient single-page applications for very old-school TV devices.

## Packages

This monorepo is managed using npm workspaces and contains the following packages:

- `packages/crt`: A lightweight UI library for creating DOM elements and managing views. It is designed with low-spec set-top boxes and older TVs in mind.
- `packages/example`: A sample single-page application that demonstrates how to use the `crt` library. It includes views for various concepts like DOM diffing, forms, and virtual lists.

## Example Application

The `packages/example` application is a functional single-page app that serves as a living demonstration of the `crt` library's features. It showcases various patterns and components for building TV-first user interfaces.

Key features demonstrated:

- **Reactive UI Pattern**: The **Player**, **Search**, and **Diff** views are built using the new declarative reactive pattern (`createSignaller`, `watch`, `diff`), showing how to build dynamic UIs that automatically update when state changes.
- **Spatial Navigation**: A robust `navigationService` that wraps `@bbc/tv-lrud-spatial` to provide keyboard-based 2D navigation, a core requirement for TV applications.
- **Component-Based Architecture**: Reusable components like `Carousel`, `Tile`, `Keyboard`, and `Dialog` are used to build complex views.
- **DOM Diffing**: The **Diff** view provides a clear example of the VDOM diffing engine in action, efficiently updating the DOM to reflect state changes.
- **Virtual List**: The **VList** view demonstrates how to render long, scrollable lists of data performantly by only rendering the visible items.
- **Routing**: A simple but effective hash-based router (`historyRouter`) manages different views and URL states.
- **Lifecycle Management**: Views demonstrate `viewDidLoad` and `destructor` lifecycle methods for setting up and tearing down event listeners and other resources.

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

All commands should be run from the root of the monorepo.

`npm run dev`

Builds the `crt` library and then starts the `example` application's dev server, watching for changes.

`npm run build`

Builds the `crt` library, outputting to `packages/crt/dist`.

`npm run build:example`

Builds the `example` application, outputting to `packages/example/dist`.

`npm run typecheck`

Checks types across the entire monorepo using TypeScript project references. Note: types are currently expressed as JSDoc types.

`npm run lint:js`

Runs ESLint on all packages.

`npm run lint:prettier`

Formats all files in the monorepo using Prettier.

`npm run test`

Runs the Vitest test suite for the entire monorepo.

`npm run coverage`

Creates a code coverage report for the test suite.

## License

`crt` is copyright (c) 2021-present John-Paul Harold <johnpaul.harold@gmail.com> and the contributors.

`crt` is free software, licensed under the Apache License, Version 2.0. See the
[`LICENSE`](LICENSE) file for more details.
