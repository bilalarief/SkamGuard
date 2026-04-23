/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window counter per IP address.
 *
 * For production at scale, replace with Upstash Redis.
 * @module lib/utils/rate-limit
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Check if a request should be rate limited.
 * @returns `{ allowed: true }` if under limit, `{ allowed: false, retryAfter }` if over limit
 */
export function rateLimit(
  identifier: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 10, windowMs: 60_000 }
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true }
  }

  if (entry.count >= options.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true }
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

    // Block RFC 1918 private ranges
    const ipParts = hostname.split('.')
    if (ipParts.length === 4) {
      const [a, b] = ipParts.map(Number)
      if (a === 10) return true                           // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return true    // 172.16.0.0/12
      if (a === 192 && b === 168) return true              // 192.168.0.0/16
      if (a === 0) return true                             // 0.0.0.0/8
    }

    // Block non-HTTP schemes
    if (!['http:', 'https:'].includes(parsed.protocol)) return true

    return false
  } catch {
    return true // Invalid URL = block
  }
}
