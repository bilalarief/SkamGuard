/**
 * Genkit instance initialization
 * IMPORTANT: Never import this in 'use client' components.
 * @module lib/ai/genkit
 */

import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/google-genai'

/**
 *Genkit instance configured with Gemini 2.0 Flash.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
})
