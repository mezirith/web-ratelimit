/**
 * Extracts the client IP address from a standard Web API Request object.
 * Checks common proxy headers used by Cloudflare, Vercel, AWS, Akamai, and Fastly.
 */
export declare function getClientIP(request: Request, customHeader?: string): string;
//# sourceMappingURL=ip.d.ts.map