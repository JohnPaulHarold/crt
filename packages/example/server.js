/**
 * @file A minimal server to demonstrate Server-Side Rendering (SSR) for the CRT project.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { loga } from 'crt';
import { renderToString } from 'crt/server';
import { createPlayerView } from './src/views/player.js';

// --- Template Setup ---
const templatePath = path.resolve(process.cwd(), 'dist/index.html');
const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

const app = express();
const port = 3001; // Use a different port from the Vite dev server

app.get('/', (req, res) => {
	// 1. Create an instance of the view you want to render on the server.
	const playerView = createPlayerView({ id: 'player' });

	// 2. Use our new `renderToString` function to generate the HTML for the app.
	const appHtml = renderToString(playerView);

	// STRATEGIC LOG: What HTML did we actually generate?
	loga.log('[server.js] Rendered App HTML:\n', appHtml);

	// 3. Inject the server-rendered HTML into the client's HTML template.
	// This ensures we use the correct script and CSS tags from the client build.
	const fullHtml = htmlTemplate.replace(
		'<div id="root"></div>', // The placeholder to find
		`<div id="root" data-ssr-view="player">${appHtml}</div>` // The replacement with our SSR signal
	);

	// 4. Send the complete HTML page to the browser.
	res.send(fullHtml);
});

// Serve the compiled client-side assets from the example package's dist folder.
app.use(express.static('dist'));

app.listen(port, () => {
	loga.log(`[SSR] Server listening at http://localhost:${port}`);
});
