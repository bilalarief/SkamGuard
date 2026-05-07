/**
 * Main analysis API endpoint — SSE streaming variant.
 * Streams step events as Server-Sent Events, then sends the final result.
 *
 * POST /api/analyze
 *
 * Event format:
 *   data: {"step":"extracting"}
 *   data: {"step":"checking_tools"}
 *   data: {"step":"analyzing"}
 *   data: {"step":"scoring"}
 *   data: {"step":"complete","result":{...RiskReport}}
 *
 * Security: Zod validation, rate limiting, input sanitization, size limits.
 * @module app/api/analyze/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeWithSteps } from '@/lib/ai/flows/analyze.flow'
import { sanitizeBase64, sanitizeText, sanitizePhone } from '@/lib/utils/sanitize'
import { rateLimit } from '@/lib/utils/rate-limit'
import { storeCommunityAnonymizedScan } from '@/lib/firebase/community-scans'

/** Maximum request body size: 12MB (accounts for base64 overhead on 10MB images) */
const MAX_BODY_SIZE = 12 * 1024 * 1024

const RequestSchema = z.object({
  image: z.string().optional(),
  text: z.string().max(5000).optional(),
  phoneNumber: z.string().max(20).optional(),
  language: z.enum(['BM', 'EN']).default('BM'),
})

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { allowed, retryAfter } = await rateLimit(clientIp, { maxRequests: 3, windowMs: 60_000 })

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: `Too many requests. Retry after ${retryAfter}s.` } },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // 2. Check Content-Length
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds 12MB limit.' } },
      { status: 413 }
    )
  }

  // 3. Parse and validate
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

  // 6. SSE streaming — emit step events as the flow progresses
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        const chunk = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(chunk))
      }

      try {
        const result = await analyzeWithSteps(
          {
            imageBase64: sanitizedImage ?? undefined,
            text: sanitizedText,
            manualPhone: sanitizedPhone,
            language,
          },
          // Step callback — emits SSE event for each pipeline step
          (step) => {
            if (step !== 'complete') {
              sendEvent({ step })
            }
          }
        )

        // Final event — includes full result
        sendEvent({ step: 'complete', success: true, data: result })

        // Fire-and-forget: community dataset
        const inputMethods = [
          image ? 'image' : null,
          text ? 'text' : null,
          phoneNumber ? 'phone' : null,
        ].filter(Boolean)
        const inputMethod = inputMethods.length > 1
          ? 'mixed'
          : (inputMethods[0] as 'image' | 'text' | 'phone') || 'text'

        storeCommunityAnonymizedScan({
          scamType: result.scamType,
          riskScore: result.overallScore,
          riskLevel: result.riskLevel,
          verdict: result.verdict,
          redFlags: result.redFlags,
          inputMethod,
          urlCount: result.urlResults?.length ?? 0,
          phoneDetected: !!result.phoneResult,
        }).catch(() => { /* silent — best-effort community data */ })

      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[API /analyze] Error:', error)
        }
        sendEvent({
          step: 'error',
          success: false,
          error: { code: 'ANALYSIS_FAILED', message: 'Analysis service unavailable. Please try again.' },
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/** Reject non-POST methods */
export function GET() {
  return NextResponse.json(
    { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
    { status: 405 }
  )
}
