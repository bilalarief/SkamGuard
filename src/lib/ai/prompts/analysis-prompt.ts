/**
 * Analysis prompt builder — combines extracted content with tool results.
 * All user-facing text pulled from i18n to ensure consistency.
 *
 * @module lib/ai/prompts/analysis-prompt
 */

import type { URLCheckResult, PhoneCheckResult } from '@/types/analysis'
import msTranslations from '@/i18n/ms.json'
import enTranslations from '@/i18n/en.json'

const i18n = { BM: msTranslations, EN: enTranslations }

/**
 * Builds the analysis prompt with all tool results as enrichment context.
 * Every user-facing string references the i18n files — no inline ternaries.
 */
export function buildAnalysisPrompt(params: {
  extracted: {
    messageText: string
    urls: string[]
    phoneNumbers: string[]
    sender: string | null
  }
  urlResults: URLCheckResult[]
  phoneResult: PhoneCheckResult | null
  ragContext?: string
  language: 'BM' | 'EN'
}): string {
  const { extracted, urlResults, phoneResult, ragContext, language } = params
  const t = i18n[language]

  const langInstruction = t.ai.langInstruction
  const languageName = t.ai.prompt.languageName
  const enforceLanguage = t.ai.prompt.enforceLanguage

  // Example values from i18n (shown to Gemini as format examples)
  const exRedFlag = t.ai.prompt.exampleRedFlag
  const exExplanation = t.ai.prompt.exampleExplanation
  const exDoNotRespond = t.ai.prompt.exampleDoNotRespond
  const exBlockNumber = t.ai.prompt.exampleBlockNumber
  const exCallNsrc = t.ai.prompt.exampleCallNsrc

  const urlContext = urlResults.length > 0
    ? `\nURL CHECK RESULTS:\n${urlResults.map((r) =>
        `- ${r.url}: verdict=${r.verdict}, malicious=${r.isMalicious}, vendors_flagged=${r.vendorsFlagged}/${r.totalVendors}, TLD=${r.tld}, free_domain=${r.isFreeDomain}${
          r.bankPhishingMatch ? `, PHISHING_TARGET=${r.bankPhishingMatch.bankName} (official: ${r.bankPhishingMatch.officialDomain})` : ''
        }`
      ).join('\n')}`
    : ''

  const phoneContext = phoneResult
    ? `\nPHONE CHECK RESULT:\n- Number: ${phoneResult.number}, Status: ${phoneResult.status}, Reports: ${phoneResult.reportCount}${
        phoneResult.scamType ? `, ScamType: ${phoneResult.scamType}` : ''
      }`
    : ''

  const ragSection = ragContext
    ? `\nKNOWN SCAM PATTERNS FROM DATABASE:\n${ragContext}\n`
    : ''

  return `ANALYZE the following content for scam indicators.

EXTRACTED CONTENT:
- Message: "${extracted.messageText}"
- URLs found: ${extracted.urls.length > 0 ? extracted.urls.join(', ') : 'none'}
- Phone numbers: ${extracted.phoneNumbers.length > 0 ? extracted.phoneNumbers.join(', ') : 'none'}
- Sender: ${extracted.sender || 'unknown'}
${urlContext}${phoneContext}${ragSection}

ANALYSIS INSTRUCTIONS:
1. Evaluate ALL extracted content for Malaysian scam indicators
2. Consider the tool check results (URL, phone) as additional evidence
3. Identify specific red flags with clear explanations
4. Classify the scam type if detectable
5. Generate a risk score from 0-100 based on evidence strength
6. ${langInstruction}
7. ${enforceLanguage}
8. For action_plan, assign each step an actionType from this list:
   - "call_police" — when user should call PDRM (999)
   - "call_nsrc" — when user should call NSRC (997) for scam reporting
   - "call_bnm" — when user should contact Bank Negara
   - "block_number" — when user should block the sender's number
   - "check_semak_mule" — when user should verify number on Semak Mule portal
   - "report_skmm" — when user should report to MCMC/SKMM
   - "report_bnm" — when user should report to Bank Negara
   - "delete_message" — when user should delete the suspicious message
   - "do_not_respond" — when user should not reply to the message
   - "do_not_click" — when user should not click any links
   - "do_not_pay" — when user should not make any payment
   - "verify_official" — when user should verify via official channels
   - "info" — for general advice that doesn't fit other types

LANGUAGE RULE: All "red_flags", "explanation", and "label" values MUST be written in ${languageName}.

Respond ONLY with valid JSON in this exact format:
{
  "risk_score": 0,
  "scam_type": "macauScam|loveScam|jobScam|investmentScam|parcelScam|phishing|loanScam|ecommerce|null",
  "red_flags": ["${exRedFlag}", "..."],
  "explanation": "${exExplanation}",
  "action_plan": [
    {"actionType": "do_not_respond", "label": "${exDoNotRespond}"},
    {"actionType": "block_number", "label": "${exBlockNumber}"},
    {"actionType": "call_nsrc", "label": "${exCallNsrc}"}
  ]
}`
}
