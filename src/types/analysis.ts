/**
 * Core analysis type definitions for SkamGuard.
 * All components and API routes import from here — never redefine inline.
 *
 * @module types/analysis
 */

/** Risk verdict classification */
export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS'

/** Risk level for UI display (granular) */
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical'

/** Recognized scam types in Malaysia */
export type ScamType =
  | 'Macau Scam'
  | 'Love Scam'
  | 'Job Scam'
  | 'Investment Scam'
  | 'Parcel Scam'
  | 'Phishing'
  | 'Loan Scam'
  | 'e-Commerce Scam'
  | null

/** Internal scam type ID used for i18n keys */
export type ScamTypeId =
  | 'macauScam'
  | 'loveScam'
  | 'jobScam'
  | 'investmentScam'
  | 'parcelScam'
  | 'phishing'
  | 'loanScam'
  | 'ecommerce'
  | null

/** Content extracted from screenshot/text by Gemini OCR */
export interface ExtractedContent {
  /** Full extracted message text */
  messageText: string
  /** URLs found in the content */
  urls: string[]
  /** Phone numbers found ('PARTIAL' if cut off in screenshot) */
  phoneNumbers: string[]
  /** Identified sender name or number */
  sender: string | null
}

/** Result from VirusTotal URL check + domain analysis */
export interface URLCheckResult {
  /** The checked URL */
  url: string
  /** Domain extracted from URL */
  domain: string
  /** Whether flagged as malicious by VirusTotal */
  isMalicious: boolean
  /** Number of vendors that flagged it */
  vendorsFlagged: number
  /** Total vendors that scanned */
  totalVendors: number
  /** Domain age in days (null if unavailable) */
  domainAgeDays: number | null
  /** Top-level domain */
  tld: string
  /** Whether the domain uses a free/suspicious TLD */
  isFreeDomain: boolean
  /** If URL resembles a Malaysian bank domain (phishing) */
  bankPhishingMatch: BankPhishingMatch | null
  /** Overall URL verdict */
  verdict: Verdict
}

/** Bank phishing comparison result */
export interface BankPhishingMatch {
  /** The bank being impersonated */
  bankName: string
  /** Official domain of the bank */
  officialDomain: string
  /** Similarity score 0-1 */
  similarity: number
}

/** Result from phone number check */
export interface PhoneCheckResult {
  /** Normalized phone number */
  number: string
  /** Number status from database */
  status: 'SCAMMER' | 'MULE' | 'UNVERIFIED' | 'CLEAN'
  /** Number of community reports */
  reportCount: number
  /** Scam type associated with number */
  scamType: ScamTypeId
  /** Pre-filled Semak Mule portal URL */
  semakMuleRedirectUrl: string
  /** Source of the check result */
  source: 'local_db' | 'firebase_community' | 'unverified'
}

/** Community phone report submission */
export interface CommunityPhoneReport {
  /** Phone number in E.164 format */
  phoneNumber: string
  /** Display format of the number */
  displayNumber: string
  /** Type of scam reported */
  scamType: ScamTypeId
  /** Free-text description from user */
  description: string
  /** Timestamp of report */
  reportedAt: string
  /** Source platform */
  source: 'community'
}

/** Aggregated tool results before scoring */
export interface ToolResult {
  /** Content analysis score from Gemini (0–40) */
  contentScore: number
  /** URL check score (0–30) */
  urlScore: number
  /** Phone check score (0–30) */
  phoneScore: number
  /** Individual URL check results */
  urlDetails: URLCheckResult[]
  /** Phone check result */
  phoneDetails: PhoneCheckResult | null
  /** List of detected red flags */
  redFlags: string[]
  /** Identified scam type */
  scamType: ScamTypeId
}

/** Action types for agent-style interactive buttons */
export type ActionType =
  | 'call_police'      // Hubungi PDRM 999
  | 'call_nsrc'        // Hubungi NSRC 997
  | 'call_bnm'         // Hubungi Bank Negara
  | 'block_number'     // Block nombor ini
  | 'check_semak_mule' // Semak di portal Semak Mule
  | 'report_skmm'      // Laporkan ke SKMM
  | 'report_bnm'       // Laporkan ke Bank Negara
  | 'delete_message'    // Padam mesej ini
  | 'do_not_respond'    // Jangan balas
  | 'do_not_click'      // Jangan klik pautan
  | 'do_not_pay'        // Jangan buat bayaran
  | 'verify_official'   // Sahkan dengan saluran rasmi
  | 'info'             // Generic info step (non-clickable)

/** Interactive action item returned by the AI agent */
export interface ActionItem {
  /** Action type — determines icon, color, and click behavior */
  type: ActionType
  /** Display label in user's language */
  label: string
  /** URL to open (for web-based actions) */
  url?: string
  /** Phone number to dial (for call actions) */
  phone?: string
}

/** Complete risk report returned to the client */
export interface RiskReport {
  /** Composite risk score (0–100) */
  overallScore: number
  /** Risk level for UI display */
  riskLevel: RiskLevel
  /** Three-tier verdict */
  verdict: Verdict
  /** Identified scam type (null if not identified) */
  scamType: ScamTypeId
  /** List of specific red flags detected */
  redFlags: string[]
  /** AI-generated explanation (in selected language) */
  explanation: string
  /** Interactive action items (agent-style clickable steps) */
  actionPlan: ActionItem[]
  /** Content extracted from input */
  extractedContent: ExtractedContent
  /** URL check results */
  urlResults: URLCheckResult[]
  /** Phone check result */
  phoneResult: PhoneCheckResult | null
  /** Pre-filled Semak Mule URL */
  semakMuleUrl: string | null
  /** ISO 8601 timestamp */
  timestamp: string
}
