/**
 * @file A minimal server to demonstrate Server-Side Rendering (SSR) for the CRT project.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loga, setPlatform } from 'crt';
// Import the server-specific platform implementation directly from the crt source.
// This is necessary because we are running in a Node.js environment and the
import { serverPlatform, renderToString } from 'crt/server';

// Import CRT server platform and view factories from your source files.
// The `renderToString` function is a simple helper, but for full control,
// we'll call the view's `render()` method directly.
import { createHomeView } from './src/views/home.js';
import { createPlayerView } from './src/views/player.js';
import { createReactiveVListView } from './src/views/reactiveVListView.js';
import { pageData } from './src/stubData/pageData.js';
import { createSearchView } from './src/views/search.js';
import { createDiffView } from './src/views/diff.js';

// --- Server Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

const distPath = path.join(__dirname, 'dist');
const distFiles = fs.readdirSync(distPath);

const BUNDLE_JS = distFiles.find(
	(file) => file.startsWith('bundle.') && file.endsWith('.js')
);
const BUNDLE_CSS = distFiles.find(
	(file) => file.startsWith('bundle.') && file.endsWith('.css')
);
// Set the CRT platform to use the server-side (non-DOM) implementation.
// This is the crucial step that prevents "document is not defined" errors.
// It must be called before any view/component rendering happens.
setPlatform(serverPlatform);

// --- Fake Data Fetching ---
// A simple function to simulate an async API call.
const fetchHomePageData = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(pageData);
		}, 50); // Simulate a 50ms network delay.
	});
};

/**
 *sSanitizes the Express `req.query` object to match the application's `RouteSearch` type.
 * Express's `req.query` can have values that are arrays or nested objects, and our
 * `RouteSearch` type is simpler (`Record<string, string | number | boolean>`).
 * This function ensures type compatibility.
 * @param {import('qs').ParsedQs} query
 * @returns {import('./src/routes.js').RouteSearch}
 */
function sanitizeQuery(query) {
	/** @type {import('./src/routes.js').RouteSearch} */
	const search = {};
	for (const key in query) {
		const value = query[key];
		// Only process string values, ignore arrays and nested objects for simplicity.
		if (typeof value === 'string') {
			// Attempt to convert to boolean/number for consistency with client-side router
			if (value === 'true') search[key] = true;
			else if (value === 'false') search[key] = false;
			else if (value.trim() !== '' && !isNaN(Number(value)))
				search[key] = Number(value);
			else search[key] = value;
		}
	}
	return search;
}

// --- HTML Template Renderer ---
// A helper to construct the final HTML document.
/**
 * @param {string} viewHtml The HTML string of the rendered view.
 * @param {string} viewName The name of the view being rendered (e.g., 'home', 'player').
 * @param {any} [initialData=null] The data to embed for client-side hydration.
 * @returns {string} The full HTML document as a string.
 */
const renderFullPage = (viewHtml, viewName, initialData = null) => {
	// If initialData exists, stringify it and embed it in a script tag.
	const dataScript = initialData
		? `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`
		: '';

	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRT Example (SSR)</title>
      <link rel="stylesheet" href="/${BUNDLE_CSS}">
    </head>
    <body>
      <div id="root" data-ssr-view="${viewName}">
        ${viewHtml}
      </div>
      ${dataScript}
      <script src="/${BUNDLE_JS}"></script>
    </body>
    </html>
  `;
};

// --- Route Handlers ---

/**
 * @typedef {object} SSRRoute
 * @property {(options: import('./src/index.js').AppViewOptions) => import('crt').BaseViewInstance} viewFactory
 * @property {string} viewName
 * @property {((req: import('express').Request) => Promise<any>)} [loadData]
 */

// A map of URL paths to their corresponding view factories and data loaders.
// This makes the server-side routing declarative and easy to extend.
/** @type {Record<string, SSRRoute>} */
const ssrRoutes = {
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

// A generic handler for all defined SSR routes.
// This loop iterates over the `ssrRoutes` map and creates a handler for each path.
Object.keys(ssrRoutes).forEach((path) => {
	const routeConfig = ssrRoutes[path];
	app.get(path, async (req, res) => {
		try {
			loga.info(
				`SSR: Rendering ${routeConfig.viewName} view for path ${path}...`
			);

			const initialData = routeConfig.loadData
				? await routeConfig.loadData(req)
				: null;

			const viewInstance = routeConfig.viewFactory({
				id: routeConfig.viewName,
				initialData: initialData,
				params: req.params,
				search: sanitizeQuery(req.query),
			});

			const viewHtml = renderToString(viewInstance);
			const fullHtml = renderFullPage(
				viewHtml,
				routeConfig.viewName,
				initialData
			);
			res.send(fullHtml);
		} catch (error) {
			loga.error(`Error rendering route ${path}:`, error);
			res.status(500).send('Server Error');
		}
	});
});

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
	const emptyHtml = renderFullPage(
		'<!-- Client-side rendering -->',
		'csr',
		null
	);
	res.send(emptyHtml);
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
