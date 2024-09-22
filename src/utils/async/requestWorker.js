import RequestWorker from 'worker!../workers/request.js';
import { HTTPStatus } from './request';

/**
 * @template T
 * @param {Object} options
 * @param {string} [options.method] REST method
 * @param {string} options.url url
 * @param {XMLHttpRequestResponseType} [options.type] expected responseType
 * @param {Record<string, string>} [options.headers] optional headers
 * @param {string} [options.body] body
 * @returns {Promise<T>}
 */

export function requestWorker(options) {
    const requestWorker = new RequestWorker();

    return new Promise((resolve, reject) => {
        requestWorker.postMessage(options);

        /**
         *
         * @param {MessageEvent} e
         */
        function messageHandler(e) {
            try {
                let response = e.data;
                console.log('response typeof', typeof response);
                if (typeof e.data === 'string') {
                    response = JSON.parse(e.data);
                }
                const status = response.status;
                const payload = response.data;

                if (status >= HTTPStatus.OK &&
                    status < HTTPStatus.MULTIPLE_CHOICES) {
                    resolve(payload);
                } else {
                    reject(payload);
                }
            } catch (error) {
                console.error('error --- ', error);
                reject(error);
            } finally {
                requestWorker.terminate();
            }
        }
        requestWorker.addEventListener('message', messageHandler);
    });
}
