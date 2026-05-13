/**
 * Firebase Admin SDK — SERVER-SIDE ONLY.
 *
 * Uses Application Default Credentials (ADC):
 * - Cloud Run production: credentials come from the attached firebase-adminsdk
 *   service account via the GCP metadata server. No key file, no env var.
 * - Local dev: run `gcloud auth application-default login` once.
 *
 * NEVER import this file from any 'use client' component.
 *
 * @module lib/firebase/admin
 */

import 'server-only'
import { initializeApp, getApps, applicationDefault, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAuth, type Auth } from 'firebase-admin/auth'

/**
 * Returns the singleton Admin app, initializing it if needed.
 * Uses ADC — no credential JSON required.
 */
function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]

  return initializeApp({
    credential: applicationDefault(), // ← ADC: metadata server on Cloud Run, gcloud locally
    projectId:
      process.env.FIREBASE_PROJECT_ID ??
      process.env.GOOGLE_CLOUD_PROJECT ??           // auto-injected on Cloud Run
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,  // fallback for local dev
  })
}

/**
 * Returns the Admin Firestore instance.
 * Use this in server-only files: API routes, lib/firebase/*.ts write paths.
 */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

/**
 * Returns the Admin Auth instance.
 * Use this to call verifyIdToken() in API routes.
 */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}
