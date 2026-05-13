/**
 * Community phone report submission API endpoint.
 * Rate limited. Firebase ID token required — uid derived server-side.
 *
 * POST /api/report-phone
 *
 * @module app/api/report-phone/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidMalaysianPhone, normalizeToE164, formatPhoneNumber } from '@/lib/validators/phone'
import { submitPhoneReport } from '@/lib/firebase/firestore'
import { getAdminAuth } from '@/lib/firebase/admin'
import { rateLimit } from '@/lib/utils/rate-limit'

const ReportSchema = z.object({
  phoneNumber: z.string().min(1),
  scamType: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  // uid intentionally removed — derived server-side from verified Firebase ID token
})

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { allowed, retryAfter } = await rateLimit(`report:${clientIp}`, { maxRequests: 3, windowMs: 60_000 })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: `Too many reports. Retry after ${retryAfter}s.` } },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // 2. Verify Firebase ID token from Authorization header
  const authHeader = request.headers.get('authorization')
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!idToken) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required to submit reports.' } },
      { status: 401 }
    )
  }

  let verifiedUid: string
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken)
    verifiedUid = decoded.uid
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired session. Please sign in again.' } },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const parsed = ReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 422 }
      )
    }

    const { phoneNumber, scamType, description } = parsed.data

    if (!isValidMalaysianPhone(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PHONE', message: 'Invalid Malaysian phone number.' } },
        { status: 400 }
      )
    }

    const normalized = normalizeToE164(phoneNumber)
    const display = formatPhoneNumber(phoneNumber)

    const result = await submitPhoneReport({
      phoneNumber: normalized,
      displayNumber: display,
      scamType: scamType || null,
      description: description || '',
      uid: verifiedUid, // trusted — cryptographically verified by Firebase Admin
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
      console.error('[API /report-phone] Error:', error)
    }
    return NextResponse.json(
      { success: false, error: { code: 'REPORT_FAILED', message: 'Failed to submit report. Please try again.' } },
      { status: 500 }
    )
  }
}