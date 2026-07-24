/**
 * Extracts the client IP address from a standard Web API Request object.
 * Checks common proxy headers used by Cloudflare, Vercel, AWS, Akamai, and Fastly.
 */

export function getClientIP(request: Request, customHeader?: string): string {
  const headers = request.headers;

  // 1. User-specified override header
  if (customHeader) {
    const customValue = headers.get(customHeader);
    if (customValue) return parseIP(customValue);
  }
  // 2. Cloudflare
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return parseIP(cfIp);

  // 3. Nginx / Vercel
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return parseIP(xRealIp);

  // 4. Standard proxy header (X-Forwarded-For: client, proxy1, proxy2)
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) return parseIP(xForwardedFor);

  // 5. Akamai / Fastly fallbacks
  const trueClientIp = headers.get("true-client-ip");
  if (trueClientIp) return parseIP(trueClientIp);

  const fastlyIp = headers.get("fastly-client-ip");
  if (fastlyIp) return parseIP(fastlyIp);

  // Fallback if no proxy headers are detected
  return "127.0.0.1";
}

/**
 * Safely parses IP string in case X-Forwarded-For contains a list of IPs.
 *
 * Headers like X-Forwarded-For often return a list of proxy hops like
 * "203.0.113.195, 70.41.3.18, 150.172.238.178". All parseIP does is split the
 * string by commas and take the first IP (which represents the original user/client)
 * and trim away whitespace.
 */
function parseIP(ipString: string | null | undefined): string {
  if (!ipString) return "127.0.0.1";

  // Take the first IP from "client, proxy1, proxy2"
  const firstSegment = ipString.split(",")[0];

  // Use optional chaining or ternary to safely handle undefined
  const cleanedIP = firstSegment ? firstSegment.trim() : '127.0.0.1';

  return cleanedIP || "127.0.0.1";
}
