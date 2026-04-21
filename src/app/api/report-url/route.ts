/**
 * Community URL report submission API endpoint.
 * Allows users to report scam URLs to the community database.
 *
 * POST /api/report-url
 *
 * @module app/api/report-url/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { submitUrlReport } from '@/lib/firebase/firestore'
import crypto from 'crypto'

const ReportSchema = z.object({
  url: z.string().url('Invalid URL format'),
  scamType: z.string().optional(),
  description: z.string().max(500).optional(),
  uid: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 422 }
      )
    }

    const { url, scamType, description, uid } = parsed.data

    // Create a safe document ID from the URL (Firestore IDs cannot contain slashes)
    const urlHash = crypto.createHash('sha256').update(url).digest('hex')

    const result = await submitUrlReport({
      url,
      urlHash,
      scamType: scamType || null,
      description: description || '',
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
    console.error('[SkamGuard][/api/report-url] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'REPORT_FAILED', message: 'Failed to submit report. Please try again.' } },
      { status: 500 }
    )
  }
}
