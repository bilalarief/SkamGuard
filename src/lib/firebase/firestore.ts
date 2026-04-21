/**
 * @module lib/firebase/firestore
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  increment,
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
  uid?: string
}): Promise<{ id: string; totalReports: number }> {
  try {
    const db = getFirestoreDb()
    const docRef = doc(db, COLLECTION_NAME, report.phoneNumber)

    // Merge document to increment report count and append scam type
    await setDoc(
      docRef,
      {
        phoneNumber: report.phoneNumber,
        displayNumber: report.displayNumber,
        reportCount: increment(1),
        lastReported: serverTimestamp(),
        source: 'community',
        ...(report.scamType ? { scamTypes: [report.scamType] } : {}), // Will overwrite field, but we check and merge on read
      },
      { merge: true }
    )

    // Add detailed reporter record in subcollection to prevent abuse mapping
    const reportersCol = collection(docRef, 'reporters')
    await addDoc(reportersCol, {
      uid: report.uid || 'anonymous',
      description: report.description,
      scamType: report.scamType,
      createdAt: serverTimestamp(),
    })

    // Fetch the updated general stats
    const snap = await getDoc(docRef)
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
      // It's possible the data structure is the new counter schema, check document directly
      const docRef = doc(db, COLLECTION_NAME, normalizedPhone)
      const directSnap = await getDoc(docRef)
      
      if (!directSnap.exists()) {
        return { totalReports: 0, scamTypes: [], lastReported: null }
      }
      
      const data = directSnap.data()
      return {
        totalReports: data.reportCount || 1,
        scamTypes: data.scamTypes || [],
        lastReported: data.lastReported?.toDate?.()?.toISOString() || null
      }
    }

    const scamTypes = new Set<string>()
    let lastReported: string | null = null

    // For backwards compatibility with old unstructured reports
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
    const db = getFirestoreDb()
    const docRef = doc(db, URL_COLLECTION_NAME, report.urlHash)

    await setDoc(
      docRef,
      {
        url: report.url,
        urlHash: report.urlHash,
        reportCount: increment(1),
        lastReported: serverTimestamp(),
        source: 'community',
        ...(report.scamType ? { scamTypes: [report.scamType] } : {}),
      },
      { merge: true }
    )

    const reportersCol = collection(docRef, 'reporters')
    await addDoc(reportersCol, {
      uid: report.uid || 'anonymous',
      description: report.description,
      scamType: report.scamType,
      createdAt: serverTimestamp(),
    })

    const snap = await getDoc(docRef)
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
  const db = getFirestoreDb()
  const docRef = doc(db, URL_COLLECTION_NAME, urlHash)

  try {
    const snap = await getDoc(docRef)

    if (!snap.exists()) {
      return { totalReports: 0, scamTypes: [], lastReported: null }
    }

    const data = snap.data()
    return {
      totalReports: data.reportCount || 0,
      scamTypes: data.scamTypes || [],
      lastReported: data.lastReported?.toDate?.()?.toISOString() || null,
    }
  } catch (error) {
    console.warn('[SkamGuard] Firestore URL query failed:', error)
    return { totalReports: 0, scamTypes: [], lastReported: null }
  }
}
