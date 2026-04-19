/**
 * Community phone report submission API endpoint.
 * Allows users to report scam phone numbers to the community database.
 *
 * POST /api/report-phone
 *
 * @module app/api/report-phone/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidMalaysianPhone, normalizeToE164, formatPhoneNumber } from '@/lib/validators/phone'
import { submitPhoneReport } from '@/lib/firebase/firestore'

const ReportSchema = z.object({
  phoneNumber: z.string().min(1),
  scamType: z.string().optional(),
  description: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
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
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        totalReports: result.totalReports,
      },
    })
  } catch (error) {
    console.error('[SkamGuard][/api/report-phone] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'REPORT_FAILED', message: 'Failed to submit report. Please try again.' } },
      { status: 500 }
    )
  }
}
