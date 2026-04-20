/**
 * Genkit singleton — configured with Gemini 2.0 Flash via Google AI plugin.
 * IMPORTANT: Never import this in 'use client' components.
 *
 * Authentication: The plugin reads GEMINI_API_KEY by default.
 * We also support GOOGLE_GENAI_API_KEY as an alias.
 *
 * @module lib/ai/genkit
 */

import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/google-genai'

// Using GOOGLE_GENAI_API_KEY as explicit env var
const resolvedApiKey = process.env.GOOGLE_GENAI_API_KEY

console.log('[SkamGuard Genkit Setup] API Key loaded status:', 
  resolvedApiKey ? `YES (Length: ${resolvedApiKey.length})` : 'NO API KEY FOUND'
)

if (!resolvedApiKey && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[SkamGuard] WARNING: No Gemini API key found.',
    'Set GOOGLE_GENAI_API_KEY in .env.local or Cloud Run via secret manager.'
  )
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: resolvedApiKey }),
  ],
  model: 'googleai/gemini-2.0-flash',
})