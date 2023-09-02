import http from "node:http"
import jsdom from "jsdom"
import { URL } from "node:url";

const host = '127.0.0.1';
const port = 8080;
const baseUrl = `http://${host}:${port}`;


const requestListener = function (req, res) {
    if (req.method === 'GET' && req.url.startsWith('/ssr')) {
      console.log('[requestListener] req', req.url);

      const url = new URL(`${baseUrl}${req.url}`);
      const view = url.searchParams.get('view');
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        html: `<div>You asked for "${view}" view</div>`,
      }));
    } else {
      res.writeHead(200);
      res.end("Hello World from Node.js HTTP Server");
    }
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on ${baseUrl}`);
});