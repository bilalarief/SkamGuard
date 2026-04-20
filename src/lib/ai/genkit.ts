/**
 * Genkit singleton — configured with Gemini 2.0 Flash via Google AI plugin.
 * IMPORTANT: Never import this in 'use client' components.
 * @module lib/ai/genkit
 */

import { genkit } from 'genkit'
import { vertexAI } from '@genkit-ai/google-genai'

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
const location = process.env.VERTEX_SEARCH_LOCATION || 'asia-southeast1'

if (!projectId && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[SkamGuard] WARNING: No Google Cloud Project ID found.',
    'Set GOOGLE_CLOUD_PROJECT_ID in .env.local to use Vertex AI'
  )
}

export const ai = genkit({
  plugins: [
    vertexAI({ projectId, location }),
  ],
  model: 'vertexai/gemini-2.0-flash',
})