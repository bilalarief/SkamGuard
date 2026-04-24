/**
 * Genkit singleton — configured with Gemini 2.5 Flash via Vertex AI.
 * Uses Application Default Credentials (ADC) for authentication.
 *
 * - Cloud Run: ADC comes from the attached Service Account automatically.
 * - Local dev: Run `gcloud auth application-default login` first.
 *
 * Firebase telemetry is enabled so flow traces appear in
 * Firebase Console → Genkit → Monitoring after deployment.
 *
 * IMPORTANT: Never import this in 'use client' components.
 * @module lib/ai/genkit
 */

import { genkit } from 'genkit'
import { vertexAI } from '@genkit-ai/google-genai'
import { enableFirebaseTelemetry } from '@genkit-ai/firebase'

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
// Gemini model region — NOT the same as Vertex Search location ('global')
const location = process.env.VERTEX_AI_LOCATION

if (!projectId) {
  console.warn(
    '[SkamGuard] GOOGLE_CLOUD_PROJECT_ID not set — Vertex AI calls will fail.',
  )
}

/**
 * Enable Firebase telemetry — sends flow traces, tool calls, and metrics
 * to Firebase Console → Genkit → Monitoring.
 * Only active in production (Cloud Run). No-op in local dev if GCP APIs unavailable.
 */
enableFirebaseTelemetry()

export const ai = genkit({
  plugins: [
    vertexAI({ projectId, location }),
  ],
  model: 'vertexai/gemini-2.5-flash',
})