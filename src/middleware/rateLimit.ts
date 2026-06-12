import { NextRequest, NextResponse } from "next/server";
import logger from "@/logger";

/**
 * Redis-backed rate limiter middleware.
 * Falls back to in-memory limiter if Redis is unavailable.
 * 
 * Usage: wrap your route handler with rateLimitMiddleware(handler, options)
 */

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 quiz generations per minute per user

// In-memory fallback
const memoryStore: Map<string, number[]> = new Map();

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: NextRequest) => string;
}

export async function checkRateLimit(
  req: NextRequest,
  key: string,
  options: RateLimitOptions = {}
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? RATE_LIMIT_MAX;

  try {
    // Attempt Redis (if env var present)
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      return await checkRedisLimit(key, windowMs, maxRequests, redisUrl);
    }
  } catch (err) {
    logger.warn("Redis rate limit failed, falling back to memory:", (err as Error).message);
  }

  // Fallback to memory
  return checkMemoryLimit(key, windowMs, maxRequests);
}

async function checkRedisLimit(
  key: string,
  windowMs: number,
  maxRequests: number,
  redisUrl: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // This is a stub. In production, use `redis` or `ioredis` client.
  // Example with ioredis:
  //
  // import { Redis } from 'ioredis';
  // const redis = new Redis(redisUrl);
  // const count = await redis.incr(`ratelimit:${key}`);
  // if (count === 1) await redis.expire(`ratelimit:${key}`, Math.ceil(windowMs / 1000));
  // return { allowed: count <= maxRequests };

  throw new Error("Redis client not initialized");
}

function checkMemoryLimit(
  key: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const list = memoryStore.get(key) || [];
  const recent = list.filter((t) => t > windowStart);
  recent.push(now);
  memoryStore.set(key, recent);

  const allowed = recent.length <= maxRequests;
  return {
    allowed,
    retryAfter: allowed ? undefined : Math.ceil((recent[0] + windowMs - now) / 1000),
  };
}

export function createRateLimitResponse(retryAfter?: number) {
  return NextResponse.json(
    { error: "Rate limit exceeded. Try again later." },
    {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    }
  );
}
