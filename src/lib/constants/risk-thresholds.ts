/**
 * Risk scoring thresholds and weight configuration.
 * @module lib/constants/risk-thresholds
 */

export const RISK_THRESHOLDS = {
  SUSPICIOUS: 31,
  DANGEROUS: 61,
} as const

export const SCORE_WEIGHTS = {
  CONTENT: 40,
  URL: 30,
  PHONE: 30,
} as const

export const HIGH_RISK_TLDS = [
  '.tk', '.xyz', '.ml', '.cf', '.ga', '.gq',
  '.top', '.work', '.click', '.link', '.buzz',
  '.rest', '.surf', '.monster', '.icu',
] as const

export const FREE_DOMAIN_PROVIDERS = [
  'freenom.com', 'tk', 'ml', 'ga', 'cf', 'gq',
  'duckdns.org', 'no-ip.org', 'freedynamicdns.net',
  'ddns.net', 'hopto.org', 'sytes.net',
  'netlify.app', 'vercel.app', 'herokuapp.com',
  'web.app', 'firebaseapp.com',
  'blogspot.com', 'wordpress.com',
] as const

export function classifyRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 10) return 'safe'
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  if (score <= 80) return 'high'
  return 'critical'
}
