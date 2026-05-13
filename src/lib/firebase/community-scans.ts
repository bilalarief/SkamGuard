/**
 * Auto-store anonymized scan results to community database.
 *
 * Called server-side from /api/analyze after a successful scan.
 * Fire-and-forget — never blocks the API response.
 *
 * Privacy: No screenshot, no personal info, no user phone number.
 * Stored: scam type, risk score, risk level, red flags, verdict, timestamp.
 *
 * @module lib/firebase/community-scans
 */

import { getAdminDb } from './admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { CommunityAnonymizedScan } from '@/types/analysis'

const COLLECTION_NAME = 'community_scans'

/**
 * Strips a RiskReport down to anonymized fields and writes to Firestore.
 * Intentionally fire-and-forget — caller should NOT await this.
 * Uses Admin SDK so writes bypass client security rules correctly.
 *
 * @param scanData - Anonymized scan fields (no PII)
 */
export async function storeCommunityAnonymizedScan(
  scanData: CommunityAnonymizedScan
): Promise<void> {
  try {
    const db = getAdminDb()

    await db.collection(COLLECTION_NAME).add({
      scamType: scanData.scamType,
      riskScore: scanData.riskScore,
      riskLevel: scanData.riskLevel,
      verdict: scanData.verdict,
      redFlags: scanData.redFlags,
      inputMethod: scanData.inputMethod,
      urlCount: scanData.urlCount,
      phoneDetected: scanData.phoneDetected,
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (error) {
    // Silent fail — community dataset is best-effort.
    // Never block or error the user's scan result.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SkamGuard] Community scan store failed:', error)
    }
  }
}