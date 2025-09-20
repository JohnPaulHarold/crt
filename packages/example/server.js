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
import { pageData } from './src/stubData/pageData.js';

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

// IMPORTANT: These route handlers for SSR must come BEFORE the static file server.
// Otherwise, express.static will serve the `dist/index.html` file for the '/' route
// before our SSR handler gets a chance to run.
app.get('/', async (req, res) => {
	loga.info('SSR: Rendering Home view...');
	const data = await fetchHomePageData();
	const homeView = createHomeView({ id: 'home', initialData: data });
	const viewHtml = renderToString(homeView);
	const fullHtml = renderFullPage(viewHtml, 'home', data);
	res.send(fullHtml);
});

app.get('/player', (req, res) => {
	loga.info('SSR: Rendering Player view...');
	const playerView = createPlayerView({ id: 'player' });
	const viewHtml = renderToString(playerView);
	const fullHtml = renderFullPage(viewHtml, 'player');
	res.send(fullHtml);
});

// Serve static files (the client-side bundle, CSS, etc.) AFTER the SSR routes.
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(port, () => {
	loga.info(`[SSR] Server listening at http://localhost:${port}`);
	loga.info(
		'Visit http://localhost:3001/ to see the server-rendered Home view.'
	);
	loga.info(
		'Visit http://localhost:3001/player to see the server-rendered Player view.'
	);
});
