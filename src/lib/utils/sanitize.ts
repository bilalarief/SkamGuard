/**
 *
 * @module lib/utils/sanitize
 */

const BASE64_PATTERN = /^[A-Za-z0-9+/=]+$/
const MAX_BASE64_LENGTH = 10 * 1024 * 1024 // ~10MB
const MAX_TEXT_LENGTH = 5000

export function sanitizeBase64(input: string): string | null {
  
  const base64Data = input.includes(',')
    ? input.split(',')[1]
    : input

  if (!base64Data || base64Data.length === 0) {
    return null
  }

  if (base64Data.length > MAX_BASE64_LENGTH) {
    return null
  }

  if (!BASE64_PATTERN.test(base64Data)) {
    return null
  }

  return base64Data
}

export function sanitizeText(input: string): string {
  return input
    .trim()
    .slice(0, MAX_TEXT_LENGTH)
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

export function sanitizePhone(input: string): string {
  return input
    .trim()
    .replace(/[^0-9+]/g, '')
    .slice(0, 20)
}
