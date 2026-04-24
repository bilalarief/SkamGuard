/**
 * Phone number checker tool.
 * Checks against local DB + Firebase community reports + Semak Mule redirect.
 *
 * SERVER-SIDE ONLY — never import in client components.
 *
 * @module lib/ai/tools/phone-checker
 */

import type { PhoneCheckResult, ScamTypeId } from '@/types/analysis'
import scammerDb from '@/data/scammer-phones.json'
import { checkCommunityReports } from '@/lib/firebase/firestore'
import { ai } from '@/lib/ai/genkit'
import { z } from 'genkit'

const SEMAK_MULE_BASE = 'https://semakmule.rmp.gov.my'

/**
 * Genkit-registered phone checker tool.
 * Gemini can invoke this via tool-calling to verify phone numbers.
 */
export const checkPhoneTool = ai.defineTool(
  {
    name: 'checkPhone',
    description: 'Check a Malaysian phone number against scam databases (local DB + community reports) and generate a Semak Mule verification URL. Call this for every phone number found in the message.',
    inputSchema: z.object({
      phoneNumber: z.string().describe('The phone number to check (Malaysian format: +60, 60, or 0 prefix)'),
    }),
    outputSchema: z.object({
      number: z.string(),
      status: z.enum(['SCAMMER', 'MULE', 'UNVERIFIED', 'CLEAN']),
      reportCount: z.number(),
      scamType: z.string().nullable(),
      semakMuleRedirectUrl: z.string(),
      source: z.enum(['local_db', 'firebase_community', 'unverified']),
    }),
  },
  async ({ phoneNumber }) => {
    const result = await checkPhone(phoneNumber)
    return result
  }
)

/**
 * Performs comprehensive phone number check:
 * 1. Check local scammer database (seed data)
 * 2. Check Firebase community reports
 * 3. Generate pre-filled Semak Mule redirect URL
 */
export async function checkPhone(phoneNumber: string | null): Promise<PhoneCheckResult> {
  if (!phoneNumber || phoneNumber === 'PARTIAL') {
    return {
      number: phoneNumber || 'UNKNOWN',
      status: 'UNVERIFIED',
      reportCount: 0,
      scamType: null,
      semakMuleRedirectUrl: SEMAK_MULE_BASE,
      source: 'unverified',
    }
  }

  const normalizedNumber = normalizePhone(phoneNumber)
  const semakMuleUrl = buildSemakMuleUrl(normalizedNumber)


  const localMatch = scammerDb.reported_numbers.find(
    (r) => r.number === normalizedNumber
  )

  if (localMatch) {
    return {
      number: normalizedNumber,
      status: localMatch.status as 'SCAMMER' | 'MULE',
      reportCount: localMatch.reports,
      scamType: localMatch.type as ScamTypeId,
      semakMuleRedirectUrl: semakMuleUrl,
      source: 'local_db',
    }
  }


  try {
    const communityResult = await checkCommunityReports(normalizedNumber)

    if (communityResult.totalReports > 0) {
      return {
        number: normalizedNumber,
        status: communityResult.totalReports >= 3 ? 'SCAMMER' : 'MULE',
        reportCount: communityResult.totalReports,
        scamType: (communityResult.scamTypes[0] as ScamTypeId) ?? null,
        semakMuleRedirectUrl: semakMuleUrl,
        source: 'firebase_community',
      }
    }
  } catch (error) {
    console.warn('[SkamGuard] Community report check failed:', error)
  }


  return {
    number: normalizedNumber,
    status: 'UNVERIFIED',
    reportCount: 0,
    scamType: null,
    semakMuleRedirectUrl: semakMuleUrl,
    source: 'unverified',
  }
}

/**
 * Normalizes Malaysian phone number to E.164 format (+60...).
 */
function normalizePhone(input: string): string {
  const cleaned = input.replace(/[\s\-().]/g, '')
  if (cleaned.startsWith('+60')) return cleaned
  if (cleaned.startsWith('60')) return `+${cleaned}`
  if (cleaned.startsWith('0')) return `+60${cleaned.slice(1)}`
  return cleaned
}

/**
 * Builds a pre-filled Semak Mule portal URL.
 * When user clicks this, the phone number is auto-pasted on the Semak Mule website.
 */
function buildSemakMuleUrl(normalizedNumber: string): string {
  // Semak Mule accepts the number in local format (without +60)
  const localFormat = normalizedNumber.startsWith('+60')
    ? `0${normalizedNumber.slice(3)}`
    : normalizedNumber

  return `${SEMAK_MULE_BASE}/?phone=${encodeURIComponent(localFormat)}`
}
