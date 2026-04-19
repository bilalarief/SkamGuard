/**
 * Extraction prompt builder for Step 1 of the analysis pipeline.
 * Handles both image (multimodal) and text-only inputs.
 *
 * @module lib/ai/prompts/extraction-prompt
 */

/**
 * Builds the extraction prompt for Gemini.
 * If an image is provided, Gemini performs OCR + entity extraction.
 * If text only, Gemini extracts URLs, phone numbers, and sender info.
 */
export function buildExtractionPrompt(input: {
  imageBase64?: string
  text?: string
}): string {
  const inputDescription = input.imageBase64
    ? 'screenshot image'
    : 'message text'

  const textSection = input.text
    ? `\nMESSAGE TEXT PROVIDED:\n${input.text}\n`
    : ''

  return `Analyze this ${inputDescription} for potential scam indicators.
${textSection}
TASK — Extract ALL visible information from the content:

1. **Full message text** — If analyzing an image, perform OCR to extract all visible text. If text is provided, use it directly.
2. **URLs/Links** — Extract any URLs, shortened links, or suspicious domains found in the content.
3. **Phone numbers** — Extract any phone numbers. If a number is partially visible or cut off in a screenshot, mark it as "PARTIAL".
4. **Sender identity** — Identify the sender's name, number, or any identifying information.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "messageText": "full extracted text content here",
  "urls": ["url1", "url2"],
  "phoneNumbers": ["number or PARTIAL"],
  "sender": "sender name or number or null"
}`
}

/**
 * Builds multimodal content parts for Gemini Vision API.
 * Returns an array that can be passed as prompt.
 */
export function buildMultimodalParts(input: {
  imageBase64?: string
  text?: string
}): Array<{ text?: string; media?: { contentType: string; url: string } }> {
  const parts: Array<{ text?: string; media?: { contentType: string; url: string } }> = []

  if (input.imageBase64) {
    parts.push({
      media: {
        contentType: 'image/jpeg',
        url: `data:image/jpeg;base64,${input.imageBase64}`,
      },
    })
  }

  parts.push({
    text: buildExtractionPrompt(input),
  })

  return parts
}
