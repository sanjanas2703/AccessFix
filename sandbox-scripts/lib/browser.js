// Opens one page in a locked-down Chromium and always closes it afterwards.
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import { chromium } from 'playwright';
import { BLOCKED_HEADER, startEgressProxy } from './proxy.js';

const CHROMIUM_PATH = process.env.CHROMIUM_PATH ?? '/usr/bin/chromium';
const NAVIGATION_TIMEOUT_MS = 30_000;
const SETTLE_MS = 1500;
export const VIEWPORT = { width: 1280, height: 800 };

// Serves the bundled demo page on an ephemeral loopback port for one job, so it
// needs no public hosting and no process left running in the shared sandbox.
async function startDemoServer(filePath) {
  const html = await readFile(filePath);
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(req.url === '/' ? html : '');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    port: server.address().port,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}

function explainNavigationError(err) {
  const message = String(err.message);
  const code = message.match(/net::(ERR_[A-Z_]+)/)?.[1];
  if (code === 'ERR_TUNNEL_CONNECTION_FAILED') {
    return 'AccessFix blocked this destination: it is private, internal or on a disallowed port.';
  }
  if (code === 'ERR_CONNECTION_RESET' || code === 'ERR_CONNECTION_CLOSED' || code === 'ERR_SSL_PROTOCOL_ERROR') {
    return `The sandbox could not reach this site (${code}). This Daytona tier only allows outbound access to essential services such as GitHub and npm, so most public sites are refused.`;
  }
  if (message.includes('Timeout')) return 'The page took too long to load in the sandbox.';
  return `The page could not be opened${code ? ` (${code})` : ''}.`;
}

// Calls fn(page, { url, blockedRequests }) with a loaded page.
export async function withPage({ url, demoFile, reducedMotion = false }, fn) {
  const demo = demoFile ? await startDemoServer(demoFile) : null;
  const proxy = await startEgressProxy({ allowLoopbackPort: demo?.port });
  const targetUrl = demo ? `http://127.0.0.1:${demo.port}/` : url;
  let browser;

  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      proxy: { server: proxy.url, bypass: '<-loopback>' },
      args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-quic',
        '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
      ],
    });

    const context = await browser.newContext({
      viewport: VIEWPORT,
      serviceWorkers: 'block',
      acceptDownloads: false,
      reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);
    page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));
    page.on('popup', (popup) => popup.close().catch(() => {}));

    let response;
    try {
      response = await page.goto(targetUrl, { waitUntil: 'load', timeout: NAVIGATION_TIMEOUT_MS });
    } catch (err) {
      throw new Error(explainNavigationError(err), { cause: err });
    }
    if (response?.headers()[BLOCKED_HEADER]) {
      throw new Error('AccessFix blocked this destination: it is private, internal or on a disallowed port.');
    }
    if (response && !response.ok()) {
      throw new Error(`The site responded with HTTP ${response.status()}, so there is no page to scan.`);
    }
    await page.waitForTimeout(SETTLE_MS);

    return await fn(page, { url: page.url(), blockedRequests: proxy.blockedRequests });
  } finally {
    await browser?.close().catch(() => {});
    await proxy.close().catch(() => {});
    await demo?.close().catch(() => {});
  }
}

export async function screenshot(page, path) {
  await page.screenshot({ path, type: 'jpeg', quality: 70, fullPage: false });
}
