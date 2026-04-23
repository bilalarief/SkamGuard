/**
 * Firestore operations for user accounts.
 * Creates/updates user documents on sign-in and manages cloud scan history.
 *
 * Collection: users/{uid}
 * Subcollection: users/{uid}/scan_history/{scanId}
 *
 * @module lib/firebase/users
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { getFirestoreDb } from './config'
import type { User } from 'firebase/auth'

const USERS_COLLECTION = 'users'
const SCAN_HISTORY_SUBCOLLECTION = 'scan_history'

export interface UserDocument {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  provider: 'email' | 'google' | 'anonymous'
  createdAt: ReturnType<typeof serverTimestamp>
  lastLoginAt: ReturnType<typeof serverTimestamp>
  scanCount: number
  reportCount: number
  language: 'BM' | 'EN'
}

export interface ScanHistoryDocument {
  overallScore: number
  riskLevel: string
  scamType: string | null
  verdict: string
  inputPreview: string
  timestamp: ReturnType<typeof serverTimestamp>
}

/**
 * Creates or updates user document on sign-in.
 * Uses merge to preserve existing data while updating lastLoginAt.
 */
export async function upsertUserDocument(firebaseUser: User): Promise<void> {
  try {
    const db = getFirestoreDb()
    const userRef = doc(db, USERS_COLLECTION, firebaseUser.uid)
    const existing = await getDoc(userRef)

    const provider = firebaseUser.providerData[0]?.providerId === 'google.com'
      ? 'google'
      : firebaseUser.isAnonymous
      ? 'anonymous'
      : 'email'

    if (!existing.exists()) {
      // New user — create document
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        provider,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        scanCount: 0,
        reportCount: 0,
        language: 'BM',
      })
    } else {
      // Existing user — update last login
      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        },
        { merge: true }
      )
    }
  } catch (error) {
    console.warn('[SkamGuard] User document upsert failed:', error)
  }
}

/**
 * Saves a scan result to the user's cloud history.
 * Also increments the user's total scan count.
 */
export async function saveScanToCloud(uid: string, scan: {
  overallScore: number
  riskLevel: string
  scamType: string | null
  verdict: string
  inputPreview: string
}): Promise<string | null> {
  try {
    const db = getFirestoreDb()

    // Add to scan_history subcollection
    const historyRef = collection(db, USERS_COLLECTION, uid, SCAN_HISTORY_SUBCOLLECTION)
    const docRef = await addDoc(historyRef, {
      ...scan,
      timestamp: serverTimestamp(),
    })

    // Increment scan count on user document
    const userRef = doc(db, USERS_COLLECTION, uid)
    await setDoc(userRef, { scanCount: increment(1) }, { merge: true })

    return docRef.id
  } catch (error) {
    console.warn('[SkamGuard] Cloud scan save failed:', error)
    return null
  }
}

/**
 * Fetches the user's cloud scan history (most recent first).
 */
export async function getCloudScanHistory(uid: string, maxResults = 50): Promise<ScanHistoryDocument[]> {
  try {
    const db = getFirestoreDb()
    const historyRef = collection(db, USERS_COLLECTION, uid, SCAN_HISTORY_SUBCOLLECTION)
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(maxResults))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        overallScore: data.overallScore,
        riskLevel: data.riskLevel,
        scamType: data.scamType,
        verdict: data.verdict,
        inputPreview: data.inputPreview,
        timestamp: data.timestamp,
      } as ScanHistoryDocument
    })
  } catch (error) {
    console.warn('[SkamGuard] Cloud history fetch failed:', error)
    return []
  }
}

/**
 * Increments the report count for a user after submitting a community report.
 * Only updates if uid is a real user (not 'guest' or 'anonymous').
 */
export async function incrementUserReportCount(uid: string): Promise<void> {
  if (!uid || uid === 'guest' || uid === 'anonymous') return

  try {
    const db = getFirestoreDb()
    const userRef = doc(db, USERS_COLLECTION, uid)
    await setDoc(userRef, { reportCount: increment(1) }, { merge: true })
  } catch (error) {
    console.warn('[SkamGuard] Report count increment failed:', error)
  }
}
