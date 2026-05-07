/**
 * Phone number check API endpoint.
 *
 * POST /api/check-phone
 *
 * Security:
 *   - Rate limited (10 checks/min/IP)
 *   - Zod schema validation
 *   - Malaysian phone format validation
 *   - Input sanitization
 *   - Production-safe error logging
 *
 * @module app/api/check-phone/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidMalaysianPhone } from '@/lib/validators/phone'
import { checkPhone } from '@/lib/ai/tools/phone-checker'
import { rateLimit } from '@/lib/utils/rate-limit'
import { sanitizePhone } from '@/lib/utils/sanitize'

const CheckPhoneSchema = z.object({
  phone: z.string().min(1).max(20),
})

export async function POST(request: NextRequest) {
  // 1. Rate limiting — 10 checks per minute per IP (prevent phone DB enumeration)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { allowed, retryAfter } = await rateLimit(`phone:${clientIp}`, { maxRequests: 10, windowMs: 60_000 })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: `Too many requests. Retry after ${retryAfter}s.` } },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    // 2. Parse and validate
    const body = await request.json()
    const parsed = CheckPhoneSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 422 }
      )
    }

    // 3. Sanitize input
    const phone = sanitizePhone(parsed.data.phone)

    // 4. Validate Malaysian phone format
    if (!isValidMalaysianPhone(phone)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PHONE', message: 'Invalid phone number. Use Malaysian format (01X-XXXXXXX).' } },
        { status: 400 }
      )
    }

    const result = await checkPhone(phone)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API /check-phone] Error:', error)
    }
    return NextResponse.json(
      { success: false, error: { code: 'CHECK_FAILED', message: 'Phone check failed. Please try again.' } },
      { status: 500 }
    )
  }
}
