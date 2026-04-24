/**
 * Scam database search tool using Vertex AI Search (RAG).
 * Queries the curated Malaysian scam patterns knowledge base.
 *
 * Falls back gracefully if Vertex AI Search is not configured.
 *
 * SERVER-SIDE ONLY.
 *
 * @module lib/ai/tools/scam-db-search
 */

import { ai } from '@/lib/ai/genkit'
import { z } from 'genkit'

/**
 * Genkit-registered scam database search tool (RAG).
 * Gemini can invoke this to search the Malaysian scam knowledge base.
 */
export const searchScamDbTool = ai.defineTool(
  {
    name: 'searchScamDatabase',
    description: 'Search the Malaysian scam knowledge base for known scam patterns, tactics, and indicators matching the given text. Use this to find similar scam cases and enrich your analysis with historical scam data.',
    inputSchema: z.object({
      query: z.string().describe('The text content to search for matching scam patterns (max 500 chars)'),
    }),
    outputSchema: z.object({
      context: z.string().describe('Relevant scam pattern context from the knowledge base, or empty string if nothing found'),
    }),
  },
  async ({ query }) => {
    const context = await searchScamDatabase(query)
    return { context }
  }
)

/**
 * Searches the scam patterns knowledge base for relevant context.
 * This context is then fed to Gemini alongside the user's input
 * for RAG (Retrieval-Augmented Generation).
 *
 * @param query - The extracted message text or URL to search against
 * @returns Relevant scam pattern context as a formatted string
 */
export async function searchScamDatabase(query: string): Promise<string> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  const datastoreId = process.env.VERTEX_SEARCH_DATASTORE_ID
  const location = process.env.VERTEX_SEARCH_LOCATION || 'global'


  if (!projectId || !datastoreId) {
    console.warn('[SkamGuard] Vertex AI Search not configured — skipping RAG')
    return ''
  }

  try {
    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${datastoreId}/servingConfigs/default_search:search`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        query: query.slice(0, 500), // Limit query length
        pageSize: 5,
        queryExpansionSpec: { condition: 'AUTO' },
        spellCorrectionSpec: { mode: 'AUTO' },
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.warn(`[SkamGuard] Vertex Search failed: ${response.status}`)
      return ''
    }

    const data = await response.json()
    const results = data.results || []

    if (results.length === 0) return ''


    const contextParts = results.map((result: VertexSearchResult, i: number) => {
      const doc = result.document?.derivedStructData || result.document?.structData || {}
      const title = doc.title || `Pattern ${i + 1}`
      const snippet = doc.snippet || doc.content || ''
      return `[${i + 1}] ${title}: ${snippet}`
    })

    return contextParts.join('\n')
  } catch (error) {
    console.warn('[SkamGuard] Vertex Search error:', error)
    return ''
  }
}

/**
 * Gets an access token for Vertex AI API.
 * In Cloud Run, uses the metadata server.
 * In local dev, falls back to GOOGLE_GENAI_API_KEY or empty.
 */
async function getAccessToken(): Promise<string> {

  try {
    const response = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      {
        headers: { 'Metadata-Flavor': 'Google' },
        signal: AbortSignal.timeout(1000),
      }
    )
    if (response.ok) {
      const data = await response.json()
      return data.access_token
    }
  } catch {
  }


  return process.env.GOOGLE_ACCESS_TOKEN || ''
}

/** Vertex AI Search result shape */
interface VertexSearchResult {
  document?: {
    derivedStructData?: Record<string, string>
    structData?: Record<string, string>
  }
}
