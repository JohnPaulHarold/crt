import http from "node:http"
import { JSDOM } from "jsdom"
import { URL, fileURLToPath } from "node:url";
import { HomeView } from "./views/home/view.js";
import path from "node:path";
import { existsSync, readFile } from "node:fs";

const host = '127.0.0.1';
const port = 8080;
const protocol = 'http'
const baseUrl = `${protocol}://${host}:${port}`;

const staticPath = './static';

const fileCache = {};

globalThis.document = new JSDOM().window.document;
globalThis.window = new JSDOM().window;

/**
 * 
 * @param {string} fileName 
 * @returns 
 */
function lookupContentType(fileName) {
  const ext = fileName.toLowerCase().split('.').slice(1).pop();
  switch (ext) {
    case 'txt':
      return 'text/plain';
    case 'js':
      return 'text/javascript'
    case 'css':
      return 'text/css'
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'mp4':
      return 'video/mp4';
    default:
      return ''
  }
}

/**
 * 
 * @param {Request} req 
 * @param {*} res 
 */
const requestListener = function (req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    let filePath = path.resolve(__dirname + req.url);
    console.log('[requestListener] filePath', filePath);

    if (existsSync(filePath)) {
      console.log('[requestListener] file exists');

      readFile(filePath, (err, data) => {
        if (err) {
          console.log('[requestListener] err', err);
          res.writeHead(404, {'Content-Type':'text/plain'});
          res.write('Error 404: resource not found.');
          res.end();
          return;
        }

        console.log('[requestListener] data', data);
        res.writeHead(200, {"Content-Type": lookupContentType(path.basename(filePath))});
        res.end(data, 'utf-8');
        return;
      });
    }

    if (req.method === 'GET' && req.url.startsWith('/ssr')) {
      console.log('[requestListener] req', req.url);

      const url = new URL(`${baseUrl}${req.url}`);
      const view = url.searchParams.get('view');
      let html;
      let script;

      switch (view) {      
        default:
          html = HomeView().outerHTML;
          script = `${baseUrl}/static/${view}.js`
          break;
      }
      
      // cors
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"
      );

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        html: html,
        script: script,
      }));
    }
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on ${baseUrl}`);
});