// Fetch wrapper for the backend. Vite proxies /api to the server in development.
// The Chrome extension has no proxy, so it calls the server directly.
const API_BASE =
  window.location.protocol === 'chrome-extension:' ? 'http://localhost:3001/api' : '/api';

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return body;
}

export function startScan(url) {
  return request('/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

export function getScan(scanId) {
  return request(`/scan/${encodeURIComponent(scanId)}`);
}
