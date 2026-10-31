// Decides which network destinations a scan may reach. Dependency-free, because
// the backend imports it too: both layers must apply the same rules.
import { lookup } from 'node:dns/promises';
import net from 'node:net';

const blocked = new net.BlockList();

// Private, loopback, link-local (including cloud metadata), shared and reserved.
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blocked.addSubnet(address, prefix, 'ipv4');
}

// Includes the transition ranges (NAT64, Teredo, 6to4) that can embed an IPv4 address.
for (const [address, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001::', 32],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
]) {
  blocked.addSubnet(address, prefix, 'ipv6');
}

export const ALLOWED_PORTS = new Set([80, 443, 8080, 8443]);

export function isBlockedIp(ip) {
  const family = net.isIP(ip);
  if (family === 0) return true;
  return blocked.check(ip, family === 4 ? 'ipv4' : 'ipv6');
}

const stripBrackets = (hostname) => hostname.replace(/^\[|\]$/g, '');

// Resolves a hostname and returns its addresses, refusing the whole host if ANY
// address is non-public. Throws a message that is safe to show to the user.
export async function resolvePublic(hostname) {
  const host = stripBrackets(hostname);
  if (net.isIP(host)) {
    if (isBlockedIp(host)) throw new Error(`${host} is a private or reserved address`);
    return [host];
  }

  const records = await lookup(host, { all: true }).catch(() => {
    throw new Error(`Could not resolve ${host}`);
  });
  if (records.length === 0) throw new Error(`Could not resolve ${host}`);
  if (records.some((record) => isBlockedIp(record.address))) {
    throw new Error(`${host} resolves to a private or reserved address`);
  }
  return records.map((record) => record.address);
}

// Checks everything about a URL except DNS. `new URL` normalises tricks such as
// http://2130706433/ and http://0x7f.1/ to 127.0.0.1 before the checks run.
export function parsePublicUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Enter a full URL, including http:// or https://');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https URLs can be scanned');
  }
  if (url.username || url.password) {
    throw new Error('URLs containing credentials are not allowed');
  }
  const port = Number(url.port || (url.protocol === 'https:' ? 443 : 80));
  if (!ALLOWED_PORTS.has(port)) {
    throw new Error(`Port ${port} is not allowed. Use one of: ${[...ALLOWED_PORTS].join(', ')}`);
  }
  const host = stripBrackets(url.hostname).toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error(`${host} is an internal hostname`);
  }
  return url;
}
