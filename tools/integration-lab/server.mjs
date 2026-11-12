import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

// Synthetic fixtures only. This lab has no credentials, writes or payment calls.
export function createLabServer() {
  return createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    const path = new URL(request.url, 'http://localhost').pathname;
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' });
      response.end(JSON.stringify({ error: 'read_only_lab' }));
      return;
    }
    if (path === '/healthz') {
      response.end(JSON.stringify({ status: 'ok', service: 'sportix-integration-lab', mode: 'synthetic' }));
    } else if (path === '/catalog') {
      response.end(JSON.stringify({ mode: 'synthetic', products: [
        { id: 'DEMO-001', name: 'Synthetic sports item', priceMinor: 10000, currency: 'SAR' }
      ] }));
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ error: 'not_found' }));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createLabServer();
  server.listen(4318, '127.0.0.1', () => console.log('Synthetic integration lab listening on loopback port 4318'));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
