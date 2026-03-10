import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const requestLog = new Map<string, number[]>();

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; retryAfterMs: number } {
  const ip = getClientIP(req);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const timestamps = (requestLog.get(ip) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    requestLog.set(ip, timestamps);
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return { allowed: true, retryAfterMs: 0 };
}

export function rateLimitResponse(retryAfterMs: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    }
  );
}

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

export function maybeCleanupRateLimitMap(maxWindowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [ip, timestamps] of requestLog) {
    const recent = timestamps.filter((t) => t > now - maxWindowMs);
    if (recent.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, recent);
    }
  }
}
