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
    const generateOptions: Record<string, unknown> = {
      system: SKAMGUARD_SYSTEM_PROMPT,
      prompt: [] as Array<Record<string, unknown>>,
      output: { format: 'json' },
    }

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
    generateOptions.prompt = promptParts

    const result = await ai.generate(generateOptions)
    const output = result.output

    if (!output) {
      return buildFallbackExtraction(input)
    }

    return {
      messageText: output.messageText || input.text || '',
      urls: Array.isArray(output.urls) ? output.urls : [],
      phoneNumbers: Array.isArray(output.phoneNumbers) ? output.phoneNumbers : [],
      sender: output.sender || null,
    }
  } catch (error) {
    console.error('[SkamGuard] Extraction failed:', error)
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
      output: { format: 'json' },
    })

    const output = result.output
    if (!output) {
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
    console.error('[SkamGuard] Analysis failed:', error)
    return buildFallbackAnalysis(params.language)
  }
}

/**
 * Fallback extraction when Gemini call fails.
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

