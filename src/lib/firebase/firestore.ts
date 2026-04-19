/**
 * @module lib/firebase/firestore
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore'
import { getFirestoreDb } from './config'

const COLLECTION_NAME = 'reported_phones'

export interface FirestorePhoneReport {
  phoneNumber: string
  displayNumber: string
  scamType: string | null
  description: string
  reportedAt: ReturnType<typeof serverTimestamp>
  source: 'community'
}

/**
 * Submits a community phone number report to the Database.
 * Returns the document ID and current total reports for this number.
 */
export async function submitPhoneReport(report: {
  phoneNumber: string
  displayNumber: string
  scamType: string | null
  description: string
}): Promise<{ id: string; totalReports: number }> {
  try {
    const db = getFirestoreDb()
    const colRef = collection(db, COLLECTION_NAME)

    const doc: FirestorePhoneReport = {
      phoneNumber: report.phoneNumber,
      displayNumber: report.displayNumber,
      scamType: report.scamType,
      description: report.description,
      reportedAt: serverTimestamp(),
      source: 'community',
    }

    const docRef = await addDoc(colRef, doc)

    // Get total reports for this number
    const countQuery = query(
      colRef,
      where('phoneNumber', '==', report.phoneNumber)
    )
    const snapshot = await getDocs(countQuery)

    return {
      id: docRef.id,
      totalReports: snapshot.size,
    }
  } catch (error) {
    console.warn('[SkamGuard] Firestore write failed:', error)
    throw new Error('Failed to submit report. Firestore rules may not be configured.')
  }
}

/**
 * Checks if a phone number has any community reports in Firestore.
 * Returns report count and the most recent scam types reported.
 */
export async function checkCommunityReports(normalizedPhone: string): Promise<{
  totalReports: number
  scamTypes: string[]
  lastReported: string | null
}> {
  const db = getFirestoreDb()
  const colRef = collection(db, COLLECTION_NAME)

  const q = query(
    colRef,
    where('phoneNumber', '==', normalizedPhone),
    orderBy('reportedAt', 'desc'),
    limit(50)
  )

  try {
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return { totalReports: 0, scamTypes: [], lastReported: null }
    }

    const scamTypes = new Set<string>()
    let lastReported: string | null = null

    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.scamType) {
        scamTypes.add(data.scamType as string)
      }
      if (!lastReported && data.reportedAt) {
        lastReported = data.reportedAt.toDate?.()?.toISOString() ?? null
      }
    })

    return {
      totalReports: snapshot.size,
      scamTypes: Array.from(scamTypes),
      lastReported,
    }
  } catch (error) {
    console.warn('[SkamGuard] Firestore query failed:', error)
    return { totalReports: 0, scamTypes: [], lastReported: null }
  }
}
