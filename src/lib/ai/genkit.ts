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

// Support both env var names — GEMINI_API_KEY is Genkit's default
const resolvedApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY

if (!resolvedApiKey && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[SkamGuard] WARNING: No Gemini API key found.',
    'Set GOOGLE_GENAI_API_KEY or GEMINI_API_KEY in .env.local'
  )
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: resolvedApiKey }),
  ],
  model: 'googleai/gemini-2.0-flash',
})
