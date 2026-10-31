// Chrome-only helpers, used when built with "npm run build:extension". The
// extension stores only the backend URL: keys and credentials stay on the server.
export const isExtension = import.meta.env.MODE === 'extension';

export const DEFAULT_BACKEND = 'http://localhost:3001';

export async function loadBackendUrl() {
  const { backendUrl } = await chrome.storage.local.get('backendUrl');
  return backendUrl ?? DEFAULT_BACKEND;
}

// Returns the normalised URL, or throws if it is not http or https.
export async function saveBackendUrl(input) {
  const url = new URL(input);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('The backend URL must start with http:// or https://');
  }
  await chrome.storage.local.set({ backendUrl: url.origin });
  return url.origin;
}

export async function activeTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab?.url ?? '';
}
