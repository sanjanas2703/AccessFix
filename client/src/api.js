// Fetch wrapper for the backend. Vite proxies /api to the server in development.

async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
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
