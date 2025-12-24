export const HTTPStatus = {
	OK: 200,
	ACCEPTED: 202,
	MULTIPLE_CHOICES: 300,
	SERVER_ERROR: 500,
	UNAUTHORIZED: 401,
};

const READY_STATE = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4,
};

export interface RequestOptions {
	method?: string;
	url: string;
	type?: XMLHttpRequestResponseType;
	headers?: Record<string, string>;
	body?: string;
}

export function httpRequest<T>(options: RequestOptions): Promise<T> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState !== READY_STATE.DONE) {
				return;
			}

			if (
				xhr.readyState === READY_STATE.DONE &&
				xhr.status >= HTTPStatus.OK &&
				xhr.status < HTTPStatus.MULTIPLE_CHOICES
			) {
				let processed = xhr.response;
				if (options.type === 'json' && typeof xhr.response === 'string') {
					processed = JSON.parse(xhr.response);
				}
				resolve(processed);
			} else {
				reject({
					status: xhr.status,
					statusText: xhr.statusText,
				});
			}
		};

		xhr.open(options.method || 'GET', options.url, true);

		xhr.responseType = options.type || '';

		if (options.headers) {
			// note: dumb reassignment fixes typecheck
			const headers = options.headers;

			Object.keys(headers).forEach((key) => {
				xhr.setRequestHeader(key, headers[key]);
			});
		}

		xhr.send(options.body);
	});
}
