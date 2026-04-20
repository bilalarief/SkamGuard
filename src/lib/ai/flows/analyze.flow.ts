/**
 * Main Genkit orchestrator flow — Extract → Tools → Analyze → Score
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
  action_plan: z.array(z.string()).describe('Numbered action steps'),
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
    const extracted = await extractContent(input)

    const allUrls = extracted.urls
    const primaryPhone = input.manualPhone || extracted.phoneNumbers[0] || null

    const [urlResults, phoneResult, ragContext] = await Promise.all([
      allUrls.length > 0
        ? Promise.all(allUrls.map((url) => checkUrl(url)))
        : Promise.resolve([] as URLCheckResult[]),

      checkPhone(primaryPhone),

      searchScamDatabase(extracted.messageText.slice(0, 300)),
    ])

    const contentAnalysis = await analyzeWithContext({
      extracted,
      urlResults,
      phoneResult,
      ragContext,
      language: input.language,
    })

    const riskReport = calculateRiskScore({
      contentAnalysis,
      urlResults,
      phoneResult,
      extracted,
    })

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

    const result = await ai.generate({
      system: SKAMGUARD_SYSTEM_PROMPT,
      prompt: promptParts,
      output: { schema: ExtractionOutputSchema },
    })

    const output = result.output
    if (!output) {
      console.warn('[SkamGuard] Extraction returned null output — using fallback')
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


async function analyzeWithContext(params: {
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
  action_plan: string[]
}> {
  const prompt = buildAnalysisPrompt({
    extracted: params.extracted,
    urlResults: params.urlResults,
    phoneResult: params.phoneResult,
    ragContext: params.ragContext,
    language: params.language,
  })

  try {
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
      action_plan: Array.isArray(output.action_plan) ? output.action_plan : [],
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
 * Fallback analysis when Gemini call fails — uses i18n for language.
 */
function buildFallbackAnalysis(language: 'BM' | 'EN') {
  const translations = language === 'BM'
    ? require('@/i18n/ms.json')
    : require('@/i18n/en.json')

  return {
    risk_score: 0,
    scam_type: null,
    red_flags: [],
    explanation: translations.ai.fallbackExplanation,
    action_plan: [translations.ai.fallbackAction],
  }
}
