/**
 * Main analysis API endpoint.
 * Receives image/text input, runs Genkit orchestrator flow, returns RiskReport.
 *
 * POST /api/analyze
 *
 * @module app/api/analyze/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeFlow } from '@/lib/ai/flows/analyze.flow'
import { sanitizeBase64, sanitizeText, sanitizePhone } from '@/lib/utils/sanitize'

const RequestSchema = z.object({
  image: z.string().optional(),
  text: z.string().max(5000).optional(),
  phoneNumber: z.string().max(20).optional(),
  language: z.enum(['BM', 'EN']).default('BM'),
})

export async function POST(request: NextRequest) {
  // 1. Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Malformed request body' } },
      { status: 400 }
    )
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 422 }
    )
  }

  const { image, text, phoneNumber, language } = parsed.data

  // 2. Must have at least one input
  if (!image && !text && !phoneNumber) {
    return NextResponse.json(
      { success: false, error: { code: 'EMPTY_INPUT', message: 'Provide image, text, or phone number' } },
      { status: 400 }
    )
  }

  // 3. Sanitize inputs
  const sanitizedImage = image ? sanitizeBase64(image) : undefined
  const sanitizedText = text ? sanitizeText(text) : undefined
  const sanitizedPhone = phoneNumber ? sanitizePhone(phoneNumber) : undefined

  // 4. Run Genkit orchestrator flow (all API keys handled server-side)
  try {
    const result = await analyzeFlow({
      imageBase64: sanitizedImage ?? undefined,
      text: sanitizedText,
      manualPhone: sanitizedPhone,
      language,
    })

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    console.error('[SkamGuard][/api/analyze] Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'ANALYSIS_FAILED', message: 'Analysis service unavailable. Please try again.' } },
      { status: 503 }
    )
  }
}

/** Reject non-POST methods */
export function GET() {
  return NextResponse.json(
    { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
    { status: 405 }
  )
}
