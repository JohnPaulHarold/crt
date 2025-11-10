/**
 * @file A minimal server to demonstrate Server-Side Rendering (SSR) for the CRT project.
 */

import type { SsrRoute } from 'crt-server';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { loga } from 'crt';
import { createSsrRouter, findAssets } from 'crt-server';

import { createHomeView } from './src/views/home.js';
import { createPlayerView } from './src/views/player.js';
import { createReactiveVListView } from './src/views/reactiveVListView.js';
import { pageData } from './src/stubData/pageData.js';
import { createSearchView } from './src/views/search.js';
import { createDiffView } from './src/views/diff.js';

// ::: Server Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

const distPath = path.join(__dirname, 'dist');

// ::: Fake Data Fetching
// A simple function to simulate an async API call.
const fetchHomePageData = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(pageData);
		}, 50); // Simulate a 50ms network delay.
	});
};

// ::: Route Handlers

// A map of URL paths to their corresponding view factories and data loaders.
// This makes the server-side routing declarative and easy to extend.
const ssrRoutes: Record<string, SsrRoute> = {
	'/': {
		viewFactory: createHomeView,
		viewName: 'home',
		loadData: fetchHomePageData,
	},
	'/search': {
		viewFactory: createSearchView,
		viewName: 'search',
	},
	'/diff': {
		viewFactory: createDiffView,
		viewName: 'diff',
	},
	'/player': {
		viewFactory: createPlayerView,
		viewName: 'player',
	},
	'/reactive-vlist': {
		viewFactory: createReactiveVListView,
		viewName: 'reactive-vlist',
	},
};

const ssrRouter = createSsrRouter({
	distPath,
	routes: ssrRoutes,
});

app.use(ssrRouter);
// Serve static files (the client-side bundle, CSS, etc.) AFTER the SSR routes.
app.use(express.static(path.join(__dirname, 'dist')));

// A catch-all route to handle client-side navigation for any route not
// explicitly handled by an SSR route above. It serves a minimal HTML shell
// that will then be taken over by the client-side router.
// As discovered in the Express v5 migration guide, the correct syntax for a
// catch-all route that includes the root path is `/{*splat}`. This is more
// declarative than using a regex and is the idiomatic way to handle this
// for client-side deep links in modern Express.
// see https://expressjs.com/en/guide/migrating-5.html
app.get('/{*splat}', (req, res) => {
	loga.info('Catch-all: Serving client-side shell.');
	const assets = findAssets(distPath);
	const clientShellHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRT Example</title>
      <link rel="stylesheet" href="/${assets.css}">
    </head>
    <body>
      <div id="root"></div>
      <script src="/${assets.js}"></script>
    </body>
    </html>
  `;
	res.send(clientShellHtml);
});

app.listen(port, () => {
	loga.info(`[SSR] Server listening at http://localhost:${port}`);
	loga.info(
		`Visit http://localhost:${port}/ to see the server-rendered Home view.`
	);
	loga.info(
		`Visit http://localhost:${port}/player to see the server-rendered Player view.`
	);
});
