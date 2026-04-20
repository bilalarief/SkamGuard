/**
 * Composite risk scoring engine.
 * Aggregates scores from content analysis, URL checks, and phone checks.
 *
 * @module lib/ai/scoring/risk-engine
 */

import { RISK_THRESHOLDS, SCORE_WEIGHTS, classifyRiskLevel } from '@/lib/constants/risk-thresholds'
import { ACTION_TYPE_METADATA, VALID_ACTION_TYPES } from '@/data/actionPlans'
import type {
  RiskReport,
  RiskLevel,
  Verdict,
  ScamTypeId,
  ActionItem,
  ActionType,
  URLCheckResult,
  PhoneCheckResult,
  ExtractedContent,
} from '@/types/analysis'

interface ScoringInput {
  contentAnalysis: {
    risk_score: number
    scam_type: string | null
    red_flags: string[]
    explanation: string
    action_plan: { actionType: string; label: string }[]
  }
  urlResults: URLCheckResult[]
  phoneResult: PhoneCheckResult | null
  extracted: ExtractedContent
}

/**
 * Calculates the composite risk score from all analysis components.
 * Returns a complete RiskReport ready for the client.
 */
export function calculateRiskScore(input: ScoringInput): RiskReport {
  const { contentAnalysis, urlResults, phoneResult, extracted } = input

  // --- Component 1: Content analysis score (0–40) ---
  const rawContentScore = Math.max(0, Math.min(100, contentAnalysis.risk_score))
  const contentScore = Math.round(rawContentScore * (SCORE_WEIGHTS.CONTENT / 100))

  // --- Component 2: URL check score (0–30) ---
  const urlScore = urlResults.length === 0
    ? 0
    : Math.min(SCORE_WEIGHTS.URL, urlResults.reduce((acc, r) => {
        let score = 0
        if (r.verdict === 'DANGEROUS') score += 30
        else if (r.verdict === 'SUSPICIOUS') score += 15

        // Bonus for bank phishing
        if (r.bankPhishingMatch) score += 10

        // Bonus for free/new domains
        if (r.isFreeDomain) score += 5
        if (r.domainAgeDays !== null && r.domainAgeDays < 30) score += 5

        return acc + score
      }, 0))

  // --- Component 3: Phone check score (0–30) ---
  let phoneScore = 0
  if (phoneResult) {
    switch (phoneResult.status) {
      case 'SCAMMER':
        phoneScore = 30
        break
      case 'MULE':
        phoneScore = 20
        break
      case 'UNVERIFIED':
        phoneScore = 5
        break
      case 'CLEAN':
        phoneScore = 0
        break
    }
  }

  // --- Composite score ---
  const overallScore = Math.min(100, contentScore + urlScore + phoneScore)

  // --- Verdict classification ---
  const verdict: Verdict =
    overallScore >= RISK_THRESHOLDS.DANGEROUS ? 'DANGEROUS'
    : overallScore >= RISK_THRESHOLDS.SUSPICIOUS ? 'SUSPICIOUS'
    : 'SAFE'

  const riskLevel: RiskLevel = classifyRiskLevel(overallScore)

  // --- Map scam type string to ScamTypeId ---
  const scamType = mapScamType(contentAnalysis.scam_type)

  return {
    overallScore,
    riskLevel,
    verdict,
    scamType,
    redFlags: contentAnalysis.red_flags,
    explanation: contentAnalysis.explanation,
    actionPlan: buildActionItems(contentAnalysis.action_plan, phoneResult),
    extractedContent: {
      messageText: extracted.messageText,
      urls: extracted.urls,
      phoneNumbers: extracted.phoneNumbers,
      sender: extracted.sender,
    },
    urlResults,
    phoneResult,
    semakMuleUrl: phoneResult?.semakMuleRedirectUrl ?? null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Maps Gemini's scam type string to our ScamTypeId enum.
 */
function mapScamType(scamType: string | null): ScamTypeId {
  if (!scamType || scamType === 'null' || scamType === 'unknown') return null

  const mapping: Record<string, ScamTypeId> = {
    'macauScam': 'macauScam',
    'macau_scam': 'macauScam',
    'Macau Scam': 'macauScam',
    'loveScam': 'loveScam',
    'love_scam': 'loveScam',
    'Love Scam': 'loveScam',
    'jobScam': 'jobScam',
    'job_scam': 'jobScam',
    'Job Scam': 'jobScam',
    'investmentScam': 'investmentScam',
    'investment_scam': 'investmentScam',
    'Investment Scam': 'investmentScam',
    'parcelScam': 'parcelScam',
    'parcel_scam': 'parcelScam',
    'Parcel Scam': 'parcelScam',
    'phishing': 'phishing',
    'Phishing': 'phishing',
    'loanScam': 'loanScam',
    'loan_scam': 'loanScam',
    'Loan Scam': 'loanScam',
    'ecommerce': 'ecommerce',
    'e-commerce': 'ecommerce',
    'e-Commerce Scam': 'ecommerce',
  }

  return mapping[scamType] ?? null
}

/**
 * Enriches Gemini's raw action items with concrete URLs and phone numbers.
 * Maps each actionType to a clickable behavior in the frontend.
 */
function buildActionItems(
  rawActions: { actionType: string; label: string }[],
  phoneResult: PhoneCheckResult | null
): ActionItem[] {
  return rawActions.map((raw) => {
    const type: ActionType = VALID_ACTION_TYPES.includes(raw.actionType as ActionType)
      ? (raw.actionType as ActionType)
      : 'info'

    // Start with base metadata from central config
    const baseMeta = ACTION_TYPE_METADATA[type] || {}

    // Override semak mule URL with phone-specific URL if available
    const metadata = type === 'check_semak_mule' && phoneResult?.semakMuleRedirectUrl
      ? { ...baseMeta, url: phoneResult.semakMuleRedirectUrl }
      : baseMeta

    return {
      type,
      label: raw.label,
      ...(metadata.url && { url: metadata.url }),
      ...(metadata.phone && { phone: metadata.phone }),
    }
  })
}
