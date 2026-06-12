import { NextRequest, NextResponse } from "next/server";
import logger from "@/logger";

/**
 * NextAuth hardening middleware.
 * - Rate limits auth attempts.
 * - Validates session secrets.
 * - Adds security headers.
 */

const AUTH_RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const AUTH_RATE_LIMIT_MAX = 10; // 10 auth attempts per minute per IP

const authAttempts: Map<string, number[]> = new Map();

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.ip || "unknown";
  return ip;
}

export function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - AUTH_RATE_LIMIT_WINDOW_MS;
  const list = authAttempts.get(ip) || [];
  const recent = list.filter((t) => t > windowStart);
  recent.push(now);
  authAttempts.set(ip, recent);
  return recent.length <= AUTH_RATE_LIMIT_MAX;
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function authHardeningMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const ip = getClientIp(req);

  // Rate limit auth attempts
  if (!checkAuthRateLimit(ip)) {
    logger.warn(`Auth rate limit exceeded for IP: ${ip}`);
    const response = NextResponse.json(
      { error: "Too many auth attempts. Try again later." },
      { status: 429 }
    );
    return addSecurityHeaders(response);
  }

  // Validate NEXTAUTH_SECRET is set
  if (!process.env.NEXTAUTH_SECRET) {
    logger.error("NEXTAUTH_SECRET not set!");
    const response = NextResponse.json(
      { error: "Auth configuration error" },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }

  try {
    const response = await handler(req);
    return addSecurityHeaders(response);
  } catch (err) {
    logger.error("Auth middleware error:", (err as Error).message);
    const response = NextResponse.json(
      { error: "Auth error" },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
