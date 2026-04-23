/**
 * Main analysis API endpoint.
 * Receives image/text input, runs Genkit orchestrator flow, returns RiskReport.
 *
 * POST /api/analyze
 *
 * Security: Zod validation, rate limiting, input sanitization, size limits.
 * @module app/api/analyze/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeFlow } from '@/lib/ai/flows/analyze.flow'
import { sanitizeBase64, sanitizeText, sanitizePhone } from '@/lib/utils/sanitize'
import { rateLimit } from '@/lib/utils/rate-limit'

/** Maximum request body size: 12MB (accounts for base64 overhead on 10MB images) */
const MAX_BODY_SIZE = 12 * 1024 * 1024

const RequestSchema = z.object({
  image: z.string().optional(),
  text: z.string().max(5000).optional(),
  phoneNumber: z.string().max(20).optional(),
  language: z.enum(['BM', 'EN']).default('BM'),
})

export async function POST(request: NextRequest) {
  // 1. Rate limiting — 10 requests per minute per IP
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { allowed, retryAfter } = rateLimit(clientIp, { maxRequests: 10, windowMs: 60_000 })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: `Too many requests. Retry after ${retryAfter}s.` } },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // 2. Check Content-Length to reject oversized payloads early
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds 12MB limit.' } },
      { status: 413 }
    )
  }

  // 3. Parse and validate request body
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

  // 4. Must have at least one input
  if (!image && !text && !phoneNumber) {
    return NextResponse.json(
      { success: false, error: { code: 'EMPTY_INPUT', message: 'Provide image, text, or phone number' } },
      { status: 400 }
    )
  }

  // 5. Sanitize inputs
  const sanitizedImage = image ? sanitizeBase64(image) : undefined
  const sanitizedText = text ? sanitizeText(text) : undefined
  const sanitizedPhone = phoneNumber ? sanitizePhone(phoneNumber) : undefined

  // 6. Run Genkit orchestrator flow (all API keys handled server-side)
  try {
    const result = await analyzeFlow({
      imageBase64: sanitizedImage ?? undefined,
      text: sanitizedText,
      manualPhone: sanitizedPhone,
      language,
    })

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    // Log server-side only — never leak error details to client
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API /analyze] Error:', error)
    }
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
