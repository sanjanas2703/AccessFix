// Fetch wrapper for the backend. Vite proxies /api to the server in development.

let apiBase = '/api';

export function setApiBase(base) {
  apiBase = base;
}

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${apiBase}${path}`, options);
  } catch {
    throw new Error(`Cannot reach the AccessFix backend at ${apiBase}. Check that it is running.`);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return body;
}

const postJson = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export function startScan(target) {
  return postJson('/scan', target);
}

export function getScan(scanId) {
  return request(`/scan/${encodeURIComponent(scanId)}`);
}

export function startPreview(scanId, adjustmentIds) {
  return postJson(`/scan/${encodeURIComponent(scanId)}/preview`, { adjustmentIds });
}

export function clearPreview(scanId) {
  return request(`/scan/${encodeURIComponent(scanId)}/preview`, { method: 'DELETE' });
}

export function imageUrl(scanId, name) {
  return `${apiBase}/scan/${encodeURIComponent(scanId)}/images/${name}`;
}
