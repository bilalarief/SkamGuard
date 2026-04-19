/**
 * Phone number check API endpoint.
 *
 * POST /api/check-phone
 *
 * @module app/api/check-phone/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { isValidMalaysianPhone } from '@/lib/validators/phone'
import { checkPhone } from '@/lib/ai/tools/phone-checker'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !isValidMalaysianPhone(phone)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PHONE', message: 'Invalid phone number. Use Malaysian format (01X-XXXXXXX).' } },
        { status: 400 }
      )
    }

    const result = await checkPhone(phone)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[SkamGuard][/api/check-phone] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CHECK_FAILED', message: 'Phone check failed. Please try again.' } },
      { status: 500 }
    )
  }
}
