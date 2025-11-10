export type ResourceType = 'css' | 'js';

const defaultOptions = {
	async: true,
	canFail: false,
};

interface LoadScriptOptions {
	async?: boolean;
	canFail?: boolean;
}

interface LoadedScriptResponse {
	loaded: boolean;
	error?: Event;
	message?: string;
}

/**
 * @param src - url of the external resource
 * @param type - either 'css' or 'js'
 * @param options - additional options for script loading behaviours
 */
export function loadScript(
	src: string,
	type: ResourceType,
	options?: LoadScriptOptions
): Promise<LoadedScriptResponse> {
	return new Promise((resolve, reject) => {
		try {
			// do an immediate check to avoid loading the same script
			const queryString = `link[href="${src}"], script[src="${src}"]`;
			const query = document.querySelector(queryString);

			if (query) {
				return resolve({
					loaded: true,
					message: `${src} already loaded`,
				});
			}

			const opts = Object.assign(defaultOptions, options || {});
			let el: HTMLScriptElement | HTMLLinkElement;
			const container = document.head || document.body;

			if (type === 'js') {
				el = document.createElement('script');
				el.setAttribute('type', 'text/javascript');
				el.async = opts.async;
				el.src = src;
			} else {
				el = document.createElement('link');
				el.setAttribute('type', 'text/css');
				el.setAttribute('href', src);
				el.setAttribute('rel', 'stylesheet');
			}

			el.addEventListener('load', () => {
				return resolve({ loaded: true });
			});

			el.addEventListener('error', (error) => {
				const payload = {
					error,
					message: `Failed to load ${src}`,
					loaded: false,
				};
				const method = opts.canFail ? resolve : reject;

				if (container.parentElement) {
					container.parentElement.removeChild(el);
				}

				return method(payload);
			});

			container.appendChild(el);
		} catch (err) {
			return reject(err);
		}
	});
}
