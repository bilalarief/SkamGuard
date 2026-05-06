/**
 * Main Genkit orchestrator flow — Extract → Parallel Tools → Analysis → Score
 *
 * OPTIMIZED APPROACH (v2):
 * - Step 1: Gemini extracts content (structured output, no tools)
 * - Step 2: Parallel tool calls with timeout protection
 *           + skip RAG for short/phone-only input
 * - Step 3: Gemini deep analysis WITHOUT tool-calling
 *           (tools already ran — results passed as context, not live tools)
 * - Step 4: Deterministic risk scoring (no AI)
 *
 * Emits step events via optional callback for SSE streaming.
 *
 * @module lib/ai/flows/analyze.flow
 */

import { z } from 'genkit'
import { ai } from '../genkit'
import { SKAMGUARD_SYSTEM_PROMPT } from '../prompts/system-prompt'
import { buildExtractionPrompt } from '../prompts/extraction-prompt'
import { buildAnalysisPrompt } from '../prompts/analysis-prompt'
import { checkUrl } from '../tools/url-checker'
import { checkPhone } from '../tools/phone-checker'
import { searchScamDatabase } from '../tools/scam-db-search'
import { calculateRiskScore } from '../scoring/risk-engine'
import type { RiskReport, ExtractedContent, URLCheckResult, PhoneCheckResult } from '@/types/analysis'
import msTranslations from '@/i18n/ms.json'
import enTranslations from '@/i18n/en.json'

// --- Zod schemas for Gemini structured output ---

const ExtractionOutputSchema = z.object({
  messageText: z.string().describe('Full extracted text content'),
  urls: z.array(z.string()).describe('All URLs found in the content'),
  phoneNumbers: z.array(z.string()).describe('All phone numbers found, or "PARTIAL" if cut off'),
  sender: z.string().nullable().describe('Sender name, number, or null if unknown'),
})

const AnalysisOutputSchema = z.object({
  risk_score: z.number().describe('Risk score from 0-100 based on evidence strength'),
  scam_type: z.string().nullable().describe('Scam type identifier or null'),
  red_flags: z.array(z.string()).describe('Specific red flags detected'),
  explanation: z.string().describe('Clear explanation in the requested language'),
  action_plan: z.array(z.object({
    actionType: z.string().describe('Action type: call_police, call_nsrc, call_bnm, block_number, check_semak_mule, report_skmm, report_bnm, delete_message, do_not_respond, do_not_click, do_not_pay, verify_official, info'),
    label: z.string().describe('Display label in user language'),
  })).describe('Interactive action steps with typed actions'),
})

const AnalyzeInputSchema = z.object({
  imageBase64: z.string().optional(),
  text: z.string().optional(),
  manualPhone: z.string().optional(),
  language: z.enum(['BM', 'EN']).default('BM'),
})

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>

/** Step event emitter for SSE streaming */
export type StepCallback = (step: string) => void

// --- Timeout utility ---

/**
 * Race a promise against a timeout.
 * Returns fallback value if the promise takes longer than `ms`.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}


export const analyzeFlow = ai.defineFlow(
  {
    name: 'skamguardAnalyze',
    inputSchema: AnalyzeInputSchema,
  },
  async (input: AnalyzeInput): Promise<RiskReport> => {
    // Use internal callback — set by analyzeWithSteps wrapper
    const emitStep = (input as AnalyzeInput & { __onStep?: StepCallback }).__onStep || (() => {})

    // ═══════════════════════════════════════════════════════════════
    // Step 1: Gemini extracts content (structured output — no tools)
    // ═══════════════════════════════════════════════════════════════
    emitStep('extracting')
    const extracted = await extractContent(input)

    // ═══════════════════════════════════════════════════════════════
    // Step 2: Parallel tool calls with timeout protection
    // - URL checks: 4s timeout per URL (VirusTotal can be slow)
    // - Phone check: fast (local DB + Firebase)
    // - RAG: skip for short text (<20 chars) or phone-only input
    // ═══════════════════════════════════════════════════════════════
    emitStep('checking_tools')
    const allUrls = extracted.urls
    const primaryPhone = input.manualPhone || extracted.phoneNumbers[0] || null
    const hasSubstantialText = extracted.messageText.length > 20

    const [urlResults, phoneResult, ragContext] = await Promise.all([
      // URL checks — each has 4s timeout, null filtered out after
      allUrls.length > 0
        ? Promise.all(
            allUrls.map((url) =>
              withTimeout(checkUrl(url), 4000, null as URLCheckResult | null)
            )
          ).then((results) => results.filter((r): r is URLCheckResult => r !== null))
        : Promise.resolve([] as URLCheckResult[]),

      // Phone check — local DB + Firebase, fast
      checkPhone(primaryPhone),

      // RAG — skip if insufficient text (phone-only, URL-only, etc.)
      hasSubstantialText
        ? withTimeout(searchScamDatabase(extracted.messageText.slice(0, 300)), 3000, '')
        : Promise.resolve(''),
    ])

    // ═══════════════════════════════════════════════════════════════
    // Step 3: Gemini deep analysis — NO tool-calling
    // All tool results already computed. Pass as context string.
    // Saves ~1-3s by avoiding tool-calling round trips.
    // ═══════════════════════════════════════════════════════════════
    emitStep('analyzing')
    const contentAnalysis = await analyzeContent({
      extracted,
      urlResults,
      phoneResult,
      ragContext,
      language: input.language,
    })

    // ═══════════════════════════════════════════════════════════════
    // Step 4: Deterministic risk scoring (no AI — pure math)
    // ═══════════════════════════════════════════════════════════════
    emitStep('scoring')
    const riskReport = calculateRiskScore({
      contentAnalysis,
      urlResults,
      phoneResult,
      extracted,
    })

    emitStep('complete')
    return riskReport
  }
)

/**
 * Public wrapper that runs analyzeFlow with step callback support.
 * The Genkit flow itself doesn't accept extra params,
 * so we inject the callback via a hidden property.
 */
export async function analyzeWithSteps(
  input: AnalyzeInput,
  onStep?: StepCallback
): Promise<RiskReport> {
  const augmented = { ...input, __onStep: onStep } as AnalyzeInput
  return analyzeFlow(augmented)
}


async function extractContent(input: AnalyzeInput): Promise<ExtractedContent> {
  const promptText = buildExtractionPrompt({
    imageBase64: input.imageBase64,
    text: input.text,
  })

  try {
    // Build multimodal prompt parts for image + text
    const promptParts: Array<Record<string, unknown>> = []

    if (input.imageBase64) {
      promptParts.push({
        media: {
          contentType: 'image/jpeg',
          url: `data:image/jpeg;base64,${input.imageBase64}`,
        },
      })
    }

    promptParts.push({ text: promptText })

    const result = await ai.generate({
      system: SKAMGUARD_SYSTEM_PROMPT,
      prompt: promptParts,
      output: { schema: ExtractionOutputSchema },
    })

    const output = result.output
    if (!output) {
      console.warn('[SkamGuard] Extraction returned null — using regex fallback')
      return buildFallbackExtraction(input)
    }

    return {
      messageText: output.messageText || input.text || '',
      urls: Array.isArray(output.urls) ? output.urls : [],
      phoneNumbers: Array.isArray(output.phoneNumbers) ? output.phoneNumbers : [],
      sender: output.sender || null,
    }
  } catch (error) {
    console.error('[SkamGuard] Extraction failed:', error instanceof Error ? error.message : error)
    return buildFallbackExtraction(input)
  }
}


/**
 * Deep analysis step — NO tool-calling.
 * Receives all pre-computed tool results as context in the prompt.
 * Tools param removed to skip tool-calling round trips (~15-25% faster).
 */
async function analyzeContent(params: {
  extracted: ExtractedContent
  urlResults: URLCheckResult[]
  phoneResult: PhoneCheckResult | null
  ragContext: string
  language: 'BM' | 'EN'
}): Promise<{
  risk_score: number
  scam_type: string | null
  red_flags: string[]
  explanation: string
  action_plan: { actionType: string; label: string }[]
}> {
  const prompt = buildAnalysisPrompt({
    extracted: params.extracted,
    urlResults: params.urlResults,
    phoneResult: params.phoneResult,
    ragContext: params.ragContext,
    language: params.language,
  })

  try {
    // NO tools param — all results already in the prompt context
    const result = await ai.generate({
      system: SKAMGUARD_SYSTEM_PROMPT,
      prompt: prompt,
      output: { schema: AnalysisOutputSchema },
    })

    const output = result.output
    if (!output) {
      console.warn('[SkamGuard] Analysis returned null output — using fallback')
      return buildFallbackAnalysis(params.language)
    }

    return {
      risk_score: typeof output.risk_score === 'number' ? output.risk_score : 0,
      scam_type: output.scam_type || null,
      red_flags: Array.isArray(output.red_flags) ? output.red_flags : [],
      explanation: output.explanation || '',
      action_plan: Array.isArray(output.action_plan)
        ? output.action_plan.map((a: { actionType?: string; label?: string }) => ({
            actionType: a.actionType || 'info',
            label: a.label || '',
          }))
        : [],
    }
  } catch (error) {
    console.error('[SkamGuard] Analysis failed:', error instanceof Error ? error.message : error)
    return buildFallbackAnalysis(params.language)
  }
}

/**
 * Fallback extraction when Gemini call fails — regex-based.
 */
function buildFallbackExtraction(input: AnalyzeInput): ExtractedContent {
  const text = input.text || ''
  const urlRegex = /https?:\/\/[^\s]+/gi
  const phoneRegex = /(\+?60|0)(1[0-9])\d{7,8}/g

  return {
    messageText: text,
    urls: text.match(urlRegex) || [],
    phoneNumbers: text.match(phoneRegex) || [],
    sender: null,
  }
}

/**
 * Fallback analysis when Gemini call fails — uses i18n map for language.
 */
function buildFallbackAnalysis(language: 'BM' | 'EN') {
  const i18nMap = { BM: msTranslations, EN: enTranslations }
  const t = i18nMap[language]

  return {
    risk_score: 0,
    scam_type: null,
    red_flags: [],
    explanation: t.ai.fallbackExplanation,
    action_plan: [{ actionType: 'info', label: t.ai.fallbackAction }],
  }
}
