/**
 * @module lib/firebase/firestore
 */

import { getAdminDb } from './admin'
import { FieldValue } from 'firebase-admin/firestore'

const COLLECTION_NAME = 'reported_phones'

export interface FirestorePhoneReport {
  phoneNumber: string
  displayNumber: string
  scamType: string | null
  description: string
  reportedAt: FirebaseFirestore.Timestamp
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
  uid?: string
}): Promise<{ id: string; totalReports: number }> {
  try {
    const db = getAdminDb()
    const docRef = db.collection(COLLECTION_NAME).doc(report.phoneNumber)

    await docRef.set(
      {
        phoneNumber: report.phoneNumber,
        displayNumber: report.displayNumber,
        reportCount: FieldValue.increment(1),
        lastReported: FieldValue.serverTimestamp(),
        source: 'community',
        ...(report.scamType ? { scamTypes: [report.scamType] } : {}),
      },
      { merge: true }
    )

    const reportersCol = docRef.collection('reporters')
    await reportersCol.add({
      uid: report.uid || 'anonymous',
      description: report.description,
      scamType: report.scamType,
      createdAt: FieldValue.serverTimestamp(),
    })

    const snap = await docRef.get()
    const data = snap.data()

    return {
      id: snap.id,
      totalReports: data?.reportCount || 1,
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
  const db = getAdminDb()
  const q = db.collection(COLLECTION_NAME)
    .where('phoneNumber', '==', normalizedPhone)
    .orderBy('reportedAt', 'desc')
    .limit(50)

  try {
    const snapshot = await q.get()

    if (snapshot.empty) {
      const docRef = db.collection(COLLECTION_NAME).doc(normalizedPhone)
      const directSnap = await docRef.get()

      if (!directSnap.exists) {
        return { totalReports: 0, scamTypes: [], lastReported: null }
      }

      const data = directSnap.data()
      return {
        totalReports: data?.reportCount || 1,
        scamTypes: data?.scamTypes || [],
        lastReported: data?.lastReported?.toDate?.()?.toISOString() || null,
      }
    }

    const scamTypes = new Set<string>()
    let lastReported: string | null = null

    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
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

// ==========================================
// URL REPORTING LOGIC
// ==========================================

const URL_COLLECTION_NAME = 'reports_url'

export async function submitUrlReport(report: {
  urlHash: string
  url: string
  scamType: string | null
  description: string
  uid?: string
}): Promise<{ id: string; totalReports: number }> {
  try {
    const db = getAdminDb()
    const docRef = db.collection(URL_COLLECTION_NAME).doc(report.urlHash)

    await docRef.set(
      {
        url: report.url,
        urlHash: report.urlHash,
        reportCount: FieldValue.increment(1),
        lastReported: FieldValue.serverTimestamp(),
        source: 'community',
        ...(report.scamType ? { scamTypes: [report.scamType] } : {}),
      },
      { merge: true }
    )

    const reportersCol = docRef.collection('reporters')
    await reportersCol.add({
      uid: report.uid || 'anonymous',
      description: report.description,
      scamType: report.scamType,
      createdAt: FieldValue.serverTimestamp(),
    })

    const snap = await docRef.get()
    const data = snap.data()

    return {
      id: snap.id,
      totalReports: data?.reportCount || 1,
    }
  } catch (error) {
    console.warn('[SkamGuard] Firestore URL write failed:', error)
    throw new Error('Failed to submit URL report.')
  }
}

export async function checkUrlCommunityReports(urlHash: string): Promise<{
  totalReports: number
  scamTypes: string[]
  lastReported: string | null
}> {
  const db = getAdminDb()
  const docRef = db.collection(URL_COLLECTION_NAME).doc(urlHash)

  try {
    const snap = await docRef.get()

    if (!snap.exists) {
      return { totalReports: 0, scamTypes: [], lastReported: null }
    }

    const data = snap.data()
    return {
      totalReports: data?.reportCount || 0,
      scamTypes: data?.scamTypes || [],
      lastReported: data?.lastReported?.toDate?.()?.toISOString() || null,
    }
  } catch (error) {
    console.warn('[SkamGuard] Firestore URL query failed:', error)
    return { totalReports: 0, scamTypes: [], lastReported: null }
  }
}