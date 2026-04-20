/**
 * Genkit singleton — configured with Gemini 2.0 Flash via Vertex AI.
 * Uses Application Default Credentials (ADC) for authentication.
 *
 * - Cloud Run: ADC comes from the attached Service Account automatically.
 * - Local dev: Run `gcloud auth application-default login` first.
 *
 * IMPORTANT: Never import this in 'use client' components.
 * @module lib/ai/genkit
 */

import { genkit } from 'genkit'
import { vertexAI } from '@genkit-ai/google-genai'

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
// Gemini model region — NOT the same as Vertex Search location ('global')
const location = process.env.VERTEX_AI_LOCATION

if (!projectId) {
  console.warn(
    'Vertex AI calls fail.',
  )
}

export const ai = genkit({
  plugins: [
    vertexAI({ projectId, location }),
  ],
  model: 'vertexai/gemini-2.5-flash',
})