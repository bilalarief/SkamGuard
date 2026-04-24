/**
 * Main Genkit orchestrator flow — Extract → Tool-Calling Analysis → Score
 *
 * HYBRID APPROACH:
 * - Step 1: Gemini extracts content (structured output, no tools needed)
 * - Step 2: Gemini analyzes + calls tools as needed (Genkit tool-calling)
 * - Step 3: Risk engine calculates final score (deterministic, no AI)
 *
 * @module lib/ai/flows/analyze.flow
 */

import { z } from 'genkit'
import { ai } from '../genkit'
import { SKAMGUARD_SYSTEM_PROMPT } from '../prompts/system-prompt'
import { buildExtractionPrompt } from '../prompts/extraction-prompt'
import { buildAnalysisPrompt } from '../prompts/analysis-prompt'
import { checkUrl } from '../tools/url-checker'
import { checkUrlTool } from '../tools/url-checker'
import { checkPhone } from '../tools/phone-checker'
import { checkPhoneTool } from '../tools/phone-checker'
import { searchScamDatabase } from '../tools/scam-db-search'
import { searchScamDbTool } from '../tools/scam-db-search'
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


export const analyzeFlow = ai.defineFlow(
  {
    name: 'skamguardAnalyze',
    inputSchema: AnalyzeInputSchema,
  },
  async (input: AnalyzeInput): Promise<RiskReport> => {
    console.log('[Flow: analyzeFlow] START. Input summary:', {
      hasImage: !!input.imageBase64,
      textLength: input.text?.length || 0,
      manualPhone: !!input.manualPhone,
      language: input.language
    })

    // ═══════════════════════════════════════════════════════════════
    // Step 1: Gemini extracts content (structured output — no tools)
    // ═══════════════════════════════════════════════════════════════
    console.log('[Flow: analyzeFlow] Step 1: Extracting content...')
    const extracted = await extractContent(input)
    console.log('[Flow: analyzeFlow] Extraction complete:', {
      urlsCount: extracted.urls.length,
      phonesCount: extracted.phoneNumbers.length,
      hasSender: !!extracted.sender
    })

    // ═══════════════════════════════════════════════════════════════
    // Step 2: Run tools deterministically (we know what content was extracted)
    // These run in parallel for speed, but only when relevant data exists
    // ═══════════════════════════════════════════════════════════════
    const allUrls = extracted.urls
    const primaryPhone = input.manualPhone || extracted.phoneNumbers[0] || null

    console.log('[Flow: analyzeFlow] Step 2: Running tools in parallel...')
    const [urlResults, phoneResult, ragContext] = await Promise.all([
      allUrls.length > 0
        ? Promise.all(allUrls.map((url) => checkUrl(url)))
        : Promise.resolve([] as URLCheckResult[]),

      checkPhone(primaryPhone),

      searchScamDatabase(extracted.messageText.slice(0, 300)),
    ])
    console.log('[Flow: analyzeFlow] Tools completed:', {
      urlsChecked: urlResults.length,
      phoneStatus: phoneResult?.status,
      ragContextFound: !!ragContext
    })

    // ═══════════════════════════════════════════════════════════════
    // Step 3: Gemini deep analysis WITH tool-calling capability
    // Gemini receives tool results AND can call tools again if needed
    // ═══════════════════════════════════════════════════════════════
    console.log('[Flow: analyzeFlow] Step 3: Gemini deep analysis with tool-calling...')
    const contentAnalysis = await analyzeWithToolCalling({
      extracted,
      urlResults,
      phoneResult,
      ragContext,
      language: input.language,
    })
    console.log('[Flow: analyzeFlow] Analysis completed. Risk Score:', contentAnalysis.risk_score)

    // ═══════════════════════════════════════════════════════════════
    // Step 4: Deterministic risk scoring (no AI — pure math)
    // ═══════════════════════════════════════════════════════════════
    console.log('[Flow: analyzeFlow] Step 4: Calculating final risk score...')
    const riskReport = calculateRiskScore({
      contentAnalysis,
      urlResults,
      phoneResult,
      extracted,
    })

    console.log('[Flow: analyzeFlow] DONE. Score:', riskReport.overallScore, 'Verdict:', riskReport.verdict)
    return riskReport
  }
)

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

    console.log('[extractContent] Calling Gemini for content extraction...')
    const result = await ai.generate({
      system: SKAMGUARD_SYSTEM_PROMPT,
      prompt: promptParts,
      output: { schema: ExtractionOutputSchema },
    })
    console.log('[extractContent] Extraction successful.')

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
 * Deep analysis step with Genkit tool-calling.
 * Gemini receives all extracted data + pre-computed tool results,
 * AND has access to registered tools for additional verification.
 */
async function analyzeWithToolCalling(params: {
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
    console.log('[analyzeWithToolCalling] Calling Gemini with tool-calling enabled...')
    const result = await ai.generate({
      system: SKAMGUARD_SYSTEM_PROMPT,
      prompt: prompt,
      tools: [checkUrlTool, checkPhoneTool, searchScamDbTool],
      output: { schema: AnalysisOutputSchema },
    })
    console.log('[analyzeWithToolCalling] Analysis with tool-calling completed.')

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
    console.error('[SkamGuard] Tool-calling analysis failed:', error instanceof Error ? error.message : error)
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
