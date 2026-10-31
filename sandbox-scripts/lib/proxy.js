// Forward proxy that all Chromium traffic is forced through.
//
// Playwright's page.route() does not intercept redirects, and it cannot see
// WebSockets opened by page scripts, so it cannot enforce the egress policy. Here
// every hop reaches the proxy, including redirects and subrequests. The proxy
// resolves the host, validates the address, then dials that exact address, so a
// host cannot pass validation and re-resolve to a private IP (DNS rebinding).
import http from 'node:http';
import net from 'node:net';
import { ALLOWED_PORTS, resolvePublic } from './netguard.js';

const MAX_TUNNEL_BYTES = 50 * 1024 * 1024;
const MAX_CONNECTIONS = 64;
const CONNECT_TIMEOUT_MS = 10_000;
const LOOPBACK_IP = '127.0.0.1';

// Marks a refusal on plain http, where Chromium sees an ordinary response. Only
// the proxy can produce it for a refused host, because refused hosts are never dialled.
export const BLOCKED_HEADER = 'x-accessfix-blocked';

export async function startEgressProxy({ allowLoopbackPort } = {}) {
  const blockedRequests = [];
  const sockets = new Set();
  let totalBytes = 0;

  const block = (host, reason) => {
    if (blockedRequests.length < 50) blockedRequests.push({ host, reason });
  };

  // Returns the validated IP to dial. Only the bundled demo server may use loopback.
  async function authorise(hostname, port) {
    if (allowLoopbackPort && hostname === LOOPBACK_IP && port === allowLoopbackPort) {
      return LOOPBACK_IP;
    }
    if (!ALLOWED_PORTS.has(port)) throw new Error(`port ${port} is not allowed`);
    const [address] = await resolvePublic(hostname);
    return address;
  }

  function track(socket) {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => {});
    socket.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_TUNNEL_BYTES) socket.destroy();
    });
  }

  const server = http.createServer(async (clientReq, clientRes) => {
    let target;
    try {
      target = new URL(clientReq.url);
    } catch {
      clientRes.writeHead(400).end();
      return;
    }

    const port = Number(target.port || 80);
    let address;
    try {
      address = await authorise(target.hostname, port);
    } catch (err) {
      block(target.hostname, err.message);
      clientRes.writeHead(403, { [BLOCKED_HEADER]: '1' }).end('Blocked by AccessFix egress policy');
      return;
    }

    const headers = { ...clientReq.headers, host: target.host };
    delete headers['proxy-connection'];
    const upstream = http.request(
      {
        host: address,
        port,
        method: clientReq.method,
        path: `${target.pathname}${target.search}`,
        headers,
        timeout: CONNECT_TIMEOUT_MS,
      },
      (upstreamRes) => {
        delete upstreamRes.headers[BLOCKED_HEADER];
        clientRes.writeHead(upstreamRes.statusCode, upstreamRes.headers);
        upstreamRes.pipe(clientRes);
      },
    );
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', () => clientRes.destroy());
    clientReq.pipe(upstream);
  });

  server.on('connect', async (req, client, head) => {
    client.on('error', () => {});
    if (sockets.size >= MAX_CONNECTIONS) {
      client.end('HTTP/1.1 503 Service Unavailable\r\n\r\n');
      return;
    }

    const separator = req.url.lastIndexOf(':');
    const hostname = req.url.slice(0, separator);
    const port = Number(req.url.slice(separator + 1));

    let address;
    try {
      address = await authorise(hostname, port);
    } catch (err) {
      block(hostname, err.message);
      client.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }

    const upstream = net.connect({ host: address, port, timeout: CONNECT_TIMEOUT_MS });
    track(client);
    track(upstream);
    upstream.once('timeout', () => upstream.destroy());
    upstream.once('connect', () => {
      upstream.setTimeout(0);
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length > 0) upstream.write(head);
      upstream.pipe(client);
      client.pipe(upstream);
    });
    upstream.once('error', () => client.destroy());
    upstream.once('close', () => client.destroy());
    client.once('close', () => upstream.destroy());
  });

  await new Promise((resolve) => server.listen(0, LOOPBACK_IP, resolve));

  return {
    url: `http://${LOOPBACK_IP}:${server.address().port}`,
    blockedRequests,
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) socket.destroy();
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}
