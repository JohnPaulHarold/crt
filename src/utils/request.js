const HTTPStatus = {
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
  DONE: 4
};

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
export function request(options) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== READY_STATE.DONE) {
        return;
      }

      if (
        xhr.readyState === READY_STATE.DONE &&
        xhr.status >= HTTPStatus.OK &&
        xhr.status < HTTPStatus.MULTIPLE_CHOICES
      ) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };

    xhr.open(options.method || "GET", options.url, true);

    xhr.responseType = options.type || '';

    if (options.headers) {
      // note: dumb reassignment fixes typecheck
      const headers = options.headers;

      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });
    }

    xhr.send(options.body);
  });
};
