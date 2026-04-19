/**
 * URL security check API endpoint.
 *
 * POST /api/check-url
 *
 * @module app/api/check-url/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { isValidUrl, normalizeUrl } from '@/lib/validators/url'
import { checkUrl } from '@/lib/ai/tools/url-checker'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_URL', message: 'Please provide a valid URL.' } },
        { status: 400 }
      )
    }

    const normalizedUrl = normalizeUrl(url)
    const result = await checkUrl(normalizedUrl)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[SkamGuard][/api/check-url] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CHECK_FAILED', message: 'URL check failed. Please try again.' } },
      { status: 500 }
    )
  }
}
