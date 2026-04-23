/**
 * URL security check API endpoint.
 * Validates input, prevents SSRF, then checks URL via VirusTotal + heuristics.
 *
 * POST /api/check-url
 *
 * @module app/api/check-url/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidUrl, normalizeUrl } from '@/lib/validators/url'
import { checkUrl } from '@/lib/ai/tools/url-checker'
import { rateLimit, isPrivateUrl } from '@/lib/utils/rate-limit'

const CheckUrlSchema = z.object({
  url: z.string().min(1).max(2048),
})

export async function POST(request: NextRequest) {
  // 1. Rate limiting — 20 URL checks per minute per IP
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { allowed, retryAfter } = rateLimit(`url:${clientIp}`, { maxRequests: 20, windowMs: 60_000 })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: `Too many requests. Retry after ${retryAfter}s.` } },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    // 2. Parse with Zod schema
    const body = await request.json()
    const parsed = CheckUrlSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 422 }
      )
    }

    const { url } = parsed.data

    // 3. Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_URL', message: 'Please provide a valid URL.' } },
        { status: 400 }
      )
    }

    // 4. SSRF prevention — block private/internal network URLs
    if (isPrivateUrl(url)) {
      return NextResponse.json(
        { success: false, error: { code: 'BLOCKED_URL', message: 'This URL cannot be checked.' } },
        { status: 400 }
      )
    }

    const normalizedUrl = normalizeUrl(url)

    // 5. Double-check normalized URL against SSRF
    if (isPrivateUrl(normalizedUrl)) {
      return NextResponse.json(
        { success: false, error: { code: 'BLOCKED_URL', message: 'This URL cannot be checked.' } },
        { status: 400 }
      )
    }

    const result = await checkUrl(normalizedUrl)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API /check-url] Error:', error)
    }
    return NextResponse.json(
      { success: false, error: { code: 'CHECK_FAILED', message: 'URL check failed. Please try again.' } },
      { status: 500 }
    )
  }
}
