/**
 * @file The public API for the crt-server package.
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { setPlatform } from 'crt';
import { serverPlatform, renderToString } from 'crt/server';

/**
 * Finds the hashed JS and CSS bundle files in a distribution directory.
 * @param {string} distPath
 * @returns {{js: string | undefined, css: string | undefined}}
 */
export function findAssets(distPath) {
	const distFiles = fs.readdirSync(distPath);
	const js = distFiles.find(
		(f) => f.startsWith('bundle.') && f.endsWith('.js')
	);
	const css = distFiles.find(
		(f) => f.startsWith('bundle.') && f.endsWith('.css')
	);
	return { js, css };
}

/**
 * Sanitizes the Express `req.query` object to match a simpler key-value type.
 * @param {import('qs').ParsedQs} query
 * @returns {Record<string, string | number | boolean>}
 */
function sanitiseQuery(query) {
	/** @type {Record<string, string | number | boolean>} */
	const search = {};
	for (const key in query) {
		const value = query[key];
		if (typeof value === 'string') {
			if (value === 'true') search[key] = true;
			else if (value === 'false') search[key] = false;
			else if (value.trim() !== '' && !isNaN(Number(value)))
				search[key] = Number(value);
			else search[key] = value;
		}
	}
	return search;
}

/**
 * Renders the default HTML page template.
 * @param {{viewHtml: string, viewName: string, initialData: any, assets: {js: string | undefined, css: string | undefined}}} templateArgs
 * @returns {string}
 */
export function renderPageTemplate({
	viewHtml,
	viewName,
	initialData,
	assets,
}) {
	const dataScript = initialData
		? `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
				initialData
			)}</script>`
		: '';

	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRT App (SSR)</title>
      <link rel="stylesheet" href="/${assets.css}">
    </head>
    <body>
      <div id="root" data-ssr-view="${viewName}">
        ${viewHtml}
      </div>
      ${dataScript}
      <script src="/${assets.js}"></script>
    </body>
    </html>
  `;
}

/**
 * @typedef {import('crt').ViewOptions & {
 *  pattern?: string;
 *  params?: Record<string, string>;
 *  search?: Record<string, string | number | boolean>;
 *  initialData?: any;
 * }} SsrViewOptions
 */

/**
 * @typedef {object} SsrRoute
 * @property {string} viewName - A name for the view, used in `data-ssr-view`.
 * @property {(req: import('express').Request) => Promise<any>} [loadData] - Optional data loader.
 * @property {(options: SsrViewOptions) => import('crt').BaseViewInstance} viewFactory - The view factory.
 */

/**
 * @typedef {object} SsrRouterOptions
 * @property {string} distPath - Path to the 'dist' directory.
 * @property {Record<string, SsrRoute>} routes - Route definitions.
 */

/**
 * Creates an Express Router with configured SSR routes.
 * @param {SsrRouterOptions} options
 * @returns {import('express').Router}
 */
export function createSsrRouter(options) {
	setPlatform(serverPlatform);
	const router = Router();
	const assets = findAssets(options.distPath);

	if (!assets.js || !assets.css) {
		throw new Error(`Could not find bundle files in ${options.distPath}`);
	}

	for (const path in options.routes) {
		const routeConfig = options.routes[path];

		router.get(path, async (req, res) => {
			try {
				const initialData = routeConfig.loadData
					? await routeConfig.loadData(req)
					: null;

				const viewInstance = routeConfig.viewFactory({
					id: routeConfig.viewName,
					initialData: initialData,
					params: req.params,
					search: sanitiseQuery(req.query),
				});

				const viewHtml = renderToString(viewInstance);
				const fullHtml = renderPageTemplate({
					viewHtml,
					viewName: routeConfig.viewName,
					initialData,
					assets,
				});
				res.send(fullHtml);
			} catch (err) {
				console.error(`[crt-server] Error rendering route ${path}:`, err);
				res.status(500).send('Internal Server Error');
			}
		});
	}

	return router;
}
