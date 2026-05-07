/**
 * Community URL report submission API endpoint.
 * Allows users to report scam URLs to the community database.
 *
 * POST /api/report-url
 *
 * Security:
 *   - Rate limited (3 reports/min/IP)
 *   - Zod schema validation
 *   - URL format validation + SSRF block
 *   - Input sanitization (description)
 *   - Production-safe error logging
 *
 * @module app/api/report-url/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { submitUrlReport } from '@/lib/firebase/firestore'
import { isValidUrl } from '@/lib/validators/url'
import { rateLimit, isPrivateUrl } from '@/lib/utils/rate-limit'
import { sanitizeUrl, sanitizeDescription } from '@/lib/utils/sanitize'
import crypto from 'crypto'

const ReportSchema = z.object({
  url: z.string().min(1).max(2048),
  scamType: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  uid: z.string().max(128).optional(),
})

export async function POST(request: NextRequest) {
  // 1. Rate limiting — 3 reports per minute per IP to prevent Firestore spam
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { allowed, retryAfter } = await rateLimit(`report-url:${clientIp}`, { maxRequests: 3, windowMs: 60_000 })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: `Too many reports. Retry after ${retryAfter}s.` } },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    // 2. Parse and validate
    const body = await request.json()
    const parsed = ReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 422 }
      )
    }

    const { url, scamType, description, uid } = parsed.data

    // 3. Sanitize inputs
    const sanitizedUrl = sanitizeUrl(url)
    const sanitizedDesc = description ? sanitizeDescription(description) : ''

    // 4. Validate URL format
    if (!isValidUrl(sanitizedUrl)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_URL', message: 'Please provide a valid URL.' } },
        { status: 400 }
      )
    }

    // 5. SSRF prevention — block internal/private network URLs
    if (isPrivateUrl(sanitizedUrl)) {
      return NextResponse.json(
        { success: false, error: { code: 'BLOCKED_URL', message: 'This URL cannot be reported.' } },
        { status: 400 }
      )
    }

    // 6. Create a safe document ID from the URL (Firestore IDs cannot contain slashes)
    const urlHash = crypto.createHash('sha256').update(sanitizedUrl).digest('hex')

    const result = await submitUrlReport({
      url: sanitizedUrl,
      urlHash,
      scamType: scamType || null,
      description: sanitizedDesc,
      uid: uid || 'anonymous',
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        totalReports: result.totalReports,
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API /report-url] Error:', error)
    }
    return NextResponse.json(
      { success: false, error: { code: 'REPORT_FAILED', message: 'Failed to submit report. Please try again.' } },
      { status: 500 }
    )
  }
}
