/**
 * URL security checker tool.
 * Combines VirusTotal API + domain age analysis + bank phishing detection.
 *
 * SERVER-SIDE ONLY — never import in client components.
 *
 * @module lib/ai/tools/url-checker
 */

import type { URLCheckResult } from '@/types/analysis'
import { HIGH_RISK_TLDS, FREE_DOMAIN_PROVIDERS } from '@/lib/constants/risk-thresholds'
import { detectBankPhishing } from '@/data/bankDomains'

const VIRUSTOTAL_BASE = 'https://www.virustotal.com/api/v3'

/**
 * Performs comprehensive URL security analysis:
 * 1. VirusTotal API scan
 * 2. TLD risk assessment
 * 3. Free domain detection
 * 4. Malaysian bank phishing comparison
 */
export async function checkUrl(url: string): Promise<URLCheckResult> {
  const domain = extractDomain(url)
  const tld = extractTld(url)
  const isFreeDomain = checkFreeDomain(domain)
  const bankPhishing = detectBankPhishing(domain)


  const vtResult = await virusTotalScan(url)


  const vendorsFlagged = vtResult?.malicious ?? 0
  const totalVendors = vtResult?.total ?? 0
  const domainAgeDays = vtResult?.domainAgeDays ?? null

  const isMalicious =
    vendorsFlagged > 3 ||
    bankPhishing.isPhishing ||
    (isFreeDomain && vendorsFlagged > 0)

  const verdict = determineUrlVerdict({
    vendorsFlagged,
    isFreeDomain,
    isHighRiskTld: HIGH_RISK_TLDS.includes(tld as typeof HIGH_RISK_TLDS[number]),
    isBankPhishing: bankPhishing.isPhishing,
    domainAgeDays,
  })

  return {
    url,
    domain,
    isMalicious,
    vendorsFlagged,
    totalVendors,
    domainAgeDays,
    tld,
    isFreeDomain,
    bankPhishingMatch: bankPhishing.isPhishing && bankPhishing.targetBank
      ? {
          bankName: bankPhishing.targetBank.name,
          officialDomain: bankPhishing.officialDomain!,
          similarity: bankPhishing.similarity,
        }
      : null,
    verdict,
  }
}

async function virusTotalScan(url: string): Promise<{
  malicious: number
  total: number
  domainAgeDays: number | null
} | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY
  if (!apiKey) {
    console.warn('[SkamGuard] VIRUSTOTAL_API_KEY not set — using heuristic fallback')
    return null
  }

  try {

    const urlId = Buffer.from(url).toString('base64url')

    const response = await fetch(`${VIRUSTOTAL_BASE}/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      signal: AbortSignal.timeout(8000), // 8s timeout
    })

    if (response.status === 404) {
      return await submitUrlForScan(url, apiKey)
    }

    if (!response.ok) {
      console.warn(`[SkamGuard] VT lookup failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    const stats = data.data?.attributes?.last_analysis_stats
    if (!stats) return null

    const malicious = (stats.malicious ?? 0) + (stats.suspicious ?? 0)
    const total = Object.values(stats).reduce((a: number, b) => a + (b as number), 0)

    const creationDate = data.data?.attributes?.creation_date
    const domainAgeDays = creationDate
      ? Math.floor((Date.now() - creationDate * 1000) / 86400000)
      : null

    return { malicious, total: total as number, domainAgeDays }
  } catch (error) {
    console.warn('[SkamGuard] VT scan error:', error)
    return null
  }
}

/**
 * Submit a URL to VirusTotal for scanning (when not previously analyzed).
 */
async function submitUrlForScan(url: string, apiKey: string): Promise<{
  malicious: number
  total: number
  domainAgeDays: number | null
} | null> {
  try {
    const formData = new URLSearchParams()
    formData.append('url', url)

    const submitResponse = await fetch(`${VIRUSTOTAL_BASE}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(5000),
    })

    if (!submitResponse.ok) return null

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const urlId = Buffer.from(url).toString('base64url')
    const resultResponse = await fetch(`${VIRUSTOTAL_BASE}/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      signal: AbortSignal.timeout(5000),
    })

    if (!resultResponse.ok) return null

    const data = await resultResponse.json()
    const stats = data.data?.attributes?.last_analysis_stats
    if (!stats) return null

    const malicious = (stats.malicious ?? 0) + (stats.suspicious ?? 0)
    const total = Object.values(stats).reduce((a: number, b) => a + (b as number), 0)

    return { malicious, total: total as number, domainAgeDays: null }
  } catch {
    return null
  }
}

/**
 * Determines URL verdict from combined signals.
 */
function determineUrlVerdict(signals: {
  vendorsFlagged: number
  isFreeDomain: boolean
  isHighRiskTld: boolean
  isBankPhishing: boolean
  domainAgeDays: number | null
}): 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' {
  const { vendorsFlagged, isFreeDomain, isHighRiskTld, isBankPhishing, domainAgeDays } = signals


  if (vendorsFlagged > 10) return 'DANGEROUS'
  if (isBankPhishing) return 'DANGEROUS'


  if (vendorsFlagged > 3) return 'SUSPICIOUS'
  if (isFreeDomain && isHighRiskTld) return 'SUSPICIOUS'
  if (domainAgeDays !== null && domainAgeDays < 30) return 'SUSPICIOUS'
  if (isHighRiskTld) return 'SUSPICIOUS'

  return 'SAFE'
}

/** Extracts the domain from a URL string */
function extractDomain(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    return new URL(normalized).hostname
  } catch {
    return url
  }
}

/** Extracts the TLD from a URL string */
function extractTld(url: string): string {
  const domain = extractDomain(url)
  const parts = domain.split('.')
  return `.${parts[parts.length - 1]}`
}

/** Checks if a domain uses a free/disposable provider */
function checkFreeDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase()
  return FREE_DOMAIN_PROVIDERS.some((provider) =>
    lowerDomain === provider || lowerDomain.endsWith(`.${provider}`)
  )
}
