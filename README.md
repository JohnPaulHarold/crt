# crt

A simple single page app. Very old school, for very old school TV devices.

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

does a `prettier` pass, writing the changes.

`npm run test`

runs through tests, watching by default. This command uses [Vitest](https://vitest.dev/).

`npm run coverage`

creates a code coverage report. Currently found in `/coverage/index.html`

## License

`crt` is copyright (c) 2021-present John-Paul Harold <johnpaul.harold@gmail.com> and the contributors.

`crt` is free software, licensed under the Apache License, Version 2.0. See the
[`LICENSE`](LICENSE) file for more details.
