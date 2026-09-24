import type { Request } from 'express';

/**
 * Best-effort client IP from Express request (supports proxies).
 */
export function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || null;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0]?.split(',')[0]?.trim() || null;
  }
  return req.ip ?? req.socket?.remoteAddress ?? null;
}
