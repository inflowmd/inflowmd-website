import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

/**
 * SSRF guard for the audit fetcher.
 *
 * /api/audit takes a URL from an untrusted caller and fetches it server-side,
 * which is a classic server-side request forgery surface: without this, anyone
 * could point it at cloud metadata or a private host and use the parsed
 * response as a probe.
 *
 * Two properties matter:
 * - Every hop is checked, not just the first. A public URL that 302s to
 *   169.254.169.254 must fail on the redirect.
 * - A DNS failure is NOT treated as internal. A site that is merely down must
 *   still produce a partial report rather than a hard rejection.
 */

export type GuardVerdict =
  | { ok: true }
  | { ok: false; reason: string };

const OK: GuardVerdict = { ok: true };

/** Hostnames that never leave the machine, regardless of DNS. */
const BLOCKED_HOSTNAMES = new Set(["localhost", "ip6-localhost", "ip6-loopback"]);

function parseIpv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((p) => Number(p));
  if (octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return null;
  return octets;
}

/** True for loopback, private, link-local/metadata and unspecified space. */
export function isInternalIpv4(ip: string): boolean {
  const o = parseIpv4(ip);
  if (!o) return false;
  const [a, b] = o;
  if (a === 127) return true; // 127.0.0.0/8   loopback
  if (a === 10) return true; // 10.0.0.0/8    private
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local + cloud metadata
  if (a === 0) return true; // 0.0.0.0/8     unspecified
  return false;
}

export function isInternalIpv6(ip: string): boolean {
  const addr = ip.toLowerCase().split("%")[0]; // strip zone index

  // IPv4-mapped / -compatible: ::ffff:127.0.0.1 must be judged as IPv4.
  const mapped = addr.match(/^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isInternalIpv4(mapped[1]);

  if (addr === "::1") return true; // loopback
  if (addr === "::") return true; // unspecified
  if (/^fe[89ab]/.test(addr)) return true; // fe80::/10 link-local
  if (/^f[cd]/.test(addr)) return true; // fc00::/7  unique local
  return false;
}

export function isInternalAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isInternalIpv4(ip);
  if (family === 6) return isInternalIpv6(ip);
  return false;
}

/**
 * Validates a single URL — scheme, hostname and every resolved address.
 *
 * @param url The absolute URL about to be fetched.
 * @returns ok:false when the target is internal or the scheme is unsupported.
 *   DNS failures return ok:true so the fetch can fail naturally and the audit
 *   can still return its partial report.
 */
export async function assertSafeUrl(url: string): Promise<GuardVerdict> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "unparseable url" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "unsupported scheme" };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    return { ok: false, reason: "loopback hostname" };
  }

  // An IP literal needs no resolution — judge it directly.
  if (isIP(hostname)) {
    return isInternalAddress(hostname)
      ? { ok: false, reason: "internal address literal" }
      : OK;
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    // Could not resolve. Not evidence of an internal target — let the fetch
    // fail on its own so the caller still gets a partial report.
    return OK;
  }

  if (addresses.some((a) => isInternalAddress(a.address))) {
    return { ok: false, reason: "resolves to an internal address" };
  }

  return OK;
}
