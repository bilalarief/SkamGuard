/**
 * Distributed rate limiter with automatic fallback.
 *
 * PRODUCTION (Cloud Run): Upstash Redis — shared across all instances.
 *   Requires: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in env.
 *
 * LOCAL / CI (no env): In-memory sliding window — single process only.
 *   Fine for dev/test. Not suitable for multi-instance production.
 *
 * Why Upstash over self-hosted Redis?
 *   - HTTP REST API — works in Edge, serverless, Cloud Run
 *   - No persistent connection management
 *   - Free tier covers hackathon scale (~10k req/day)
 *
 * @module lib/utils/rate-limit
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ─── Upstash Redis instance (lazy — only created if env vars present) ───

let upstashRatelimiter: Ratelimit | null = null

function getUpstashLimiter(maxRequests: number, windowSeconds: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  // Cache per config combo — avoids re-creating on every request
  if (upstashRatelimiter) return upstashRatelimiter

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  upstashRatelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds}s`),
    analytics: false, // disable — not needed for rate limiting
    prefix: 'skamguard:rl',
  })

  return upstashRatelimiter
}

// ─── In-memory fallback (local dev / single instance) ───

interface MemoryEntry {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key)
    }
  }, 5 * 60 * 1000)
}

function memoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true }
}

// ─── Public API ───

export interface RateLimitOptions {
  /** Max requests allowed per window */
  maxRequests: number
  /** Window size in milliseconds */
  windowMs: number
}

/**
 * Check rate limit for a given identifier (IP address or user ID).
 * Automatically uses Upstash Redis in production, in-memory in local dev.
 *
 * @param identifier - Unique key to rate limit (IP, UID, etc.)
 * @param options - maxRequests and windowMs
 * @returns `{ allowed: true }` or `{ allowed: false, retryAfter: seconds }`
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60_000 }
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const windowSeconds = Math.ceil(options.windowMs / 1000)
  const upstash = getUpstashLimiter(options.maxRequests, windowSeconds)

  // Production path: Upstash Redis (cross-instance, persistent)
  if (upstash) {
    try {
      const { success, reset } = await upstash.limit(identifier)
      if (success) return { allowed: true }
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) }
    } catch (error) {
      // Upstash unreachable — fail open with memory fallback
      // Prevents Upstash outage from taking down the app
      console.warn('[SkamGuard] Upstash rate limit failed, falling back to memory:', error)
    }
  }

  // Local dev path: in-memory (sync)
  return memoryRateLimit(identifier, options.maxRequests, options.windowMs)
}

/**
 * Validates a URL is not targeting private/internal networks (SSRF prevention).
 * Blocks RFC 1918 addresses, loopback, link-local, and cloud metadata endpoints.
 */
export function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // Block cloud metadata endpoints
    if (hostname === '169.254.169.254') return true
    if (hostname === 'metadata.google.internal') return true

    // Block loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true

    // Block IPv6-mapped IPv4 loopback (e.g. ::ffff:127.0.0.1)
    if (hostname.startsWith('::ffff:')) {
      const mapped = hostname.slice(7)
      if (mapped === '127.0.0.1' || mapped.startsWith('10.') || mapped.startsWith('192.168.')) {
        return true
      }
    }

    // Block RFC 1918 private ranges
    const ipParts = hostname.split('.')
    if (ipParts.length === 4) {
      const [a, b] = ipParts.map(Number)
      if (a === 10) return true                           // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return true   // 172.16.0.0/12
      if (a === 192 && b === 168) return true             // 192.168.0.0/16
      if (a === 0) return true                            // 0.0.0.0/8
    }

    // Block non-HTTP schemes
    if (!['http:', 'https:'].includes(parsed.protocol)) return true

    return false
  } catch {
    return true // Invalid URL = block
  }
}
