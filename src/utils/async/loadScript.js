/** @enum {string} */
const ResourceType = {
  CSS: 'css',
  JS: 'js',
};

const defaultOptions = {
  async: true,
  canFail: false,
};

/**
* LoadScriptOptions
* @typedef {Object} LoadScriptOptions
* @property {boolean} [async] - if the `aysnc` attribute is added or not
* @property {boolean} [canFail] - if the failure to add this script is critical. Will reject with error if so
*/

/**
* LoadedScriptSuccess
* @typedef {Object} LoadedScriptResponse
* @property {boolean} loaded - if the resource loaded or not
* @property {Event} [error] - error object
* @property {string} [message] - error message
*/

/**
* @name loadScript
* @param {string} src - url of the external resource
* @param {ResourceType} type - either 'css' or 'js'
* @param {LoadScriptOptions} [options] - additional options for script loading behaviours
* @returns {Promise<LoadedScriptResponse>}
*/
export function loadScript(src, type, options) {
  return new Promise((resolve, reject) => {
      try {
          // do an immediate check to avoid loading the same script
          const queryString = `link[href="${src}"], script[src="${src}"]`;
          const query = document.querySelector(queryString);
        
          if (query) {
            return resolve({loaded: true, message: `${src} already loaded`});
          }

          const opts = Object.assign(defaultOptions, options || {});
          /** @type {HTMLScriptElement|HTMLLinkElement} */
          let el;
          const container = document.head || document.body;

          if (type === ResourceType.JS) {
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
