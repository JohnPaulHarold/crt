/**
 * @file The public API for the crt-server package.
 */

import type { ParsedQs } from 'qs';
import type { ViewOptions, BaseViewInstance } from 'crt';

import { Router } from 'express';
import fs from 'fs';
import { setPlatform } from 'crt';
import { serverPlatform, renderToString } from 'crt/server';

/**
 * Finds the hashed JS and CSS bundle files in a distribution directory.
 */
export function findAssets(distPath: string): {
	js: string | undefined;
	css: string | undefined;
} {
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
 * Sanitises the Express `req.query` object to match a simpler key-value type.
 */
function sanitiseQuery(
	query: ParsedQs
): Record<string, string | number | boolean> {
	/** @type {Record<string, string | number | boolean>} */
	const search: Record<string, string | number | boolean> = {};
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

export interface RenderPageTemplateOptions {
	viewHtml: string;
	viewName: string;
	initialData: Record<string, unknown> | null;
	assets: { js: string | undefined; css: string | undefined };
}

/**
 * Renders the default HTML page template.
 */
export function renderPageTemplate({
	viewHtml,
	viewName,
	initialData,
	assets,
}: RenderPageTemplateOptions): string {
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

export type SsrViewOptions = ViewOptions & {
	pattern?: string;
	params?: Record<string, string>;
	search?: Record<string, string | number | boolean>;
	initialData?: Record<string, unknown>;
};

export interface SsrRoute {
	viewName: string;
	loadData?: (req: import('express').Request) => Promise<unknown>;
	viewFactory: (options: SsrViewOptions) => BaseViewInstance;
}

export interface SsrRouterOptions {
	distPath: string;
	routes: Record<string, SsrRoute>;
}

/**
 * Creates an Express Router with configured SSR routes.
 */
export function createSsrRouter(options: SsrRouterOptions): Router {
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
				const loadedData = routeConfig.loadData
					? await routeConfig.loadData(req)
					: null;

				// Ensure that the loaded data is an object that can be serialized.
				const initialData =
					typeof loadedData === 'object' && loadedData !== null
						? (loadedData as Record<string, unknown>)
						: null;

				if (loadedData !== null && initialData === null) {
					console.warn(
						`[crt-server] loadData for route ${path} returned a non-object value, which will be ignored.`
					);
				}

				const viewInstance = routeConfig.viewFactory({
					id: routeConfig.viewName,
					initialData: initialData ?? undefined, // Pass undefined if initialData is null
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
